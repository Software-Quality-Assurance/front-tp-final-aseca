$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$releaseApk = Join-Path $root 'android\app\build\outputs\apk\release\app-release.apk'
$buildScript = Join-Path $PSScriptRoot 'build-android-release.cmd'
$appiumEntry = Join-Path $root 'node_modules\appium\index.js'
$nodeExe = (Get-Command node.exe -ErrorAction Stop).Source
$appiumPort = if ($env:APPIUM_PORT) { $env:APPIUM_PORT } else { '4774' }
$backendUrl = if ($env:APPIUM_API_URL) { $env:APPIUM_API_URL } else { 'http://localhost:8080' }
$appiumJob = $null
$appiumLogsDir = Join-Path $root 'appium\logs'
$runId = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$appiumStdoutLog = Join-Path $appiumLogsDir "appium-stdout-$runId.log"
$appiumStderrLog = Join-Path $appiumLogsDir "appium-stderr-$runId.log"

$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$adbPath = Join-Path $env:ANDROID_HOME 'platform-tools\adb.exe'

function Stop-StaleProcessOnPort([int] $port) {
  try {
    $connection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction Stop |
      Select-Object -First 1
    if (-not $connection) {
      return
    }

    Stop-Process -Id $connection.OwningProcess -Force -ErrorAction Stop
    Start-Sleep -Seconds 1
  } catch {
    # If the port is already free or the process exits between checks, continue.
  }
}

function Test-TcpEndpoint([Uri] $uri) {
  $port = if ($uri.IsDefaultPort) {
    if ($uri.Scheme -eq 'https') { 443 } else { 80 }
  } else {
    $uri.Port
  }

  $client = [System.Net.Sockets.TcpClient]::new()
  try {
    $connect = $client.ConnectAsync($uri.Host, $port)
    if (-not $connect.Wait(3000)) {
      return $false
    }
    return $client.Connected
  } catch {
    return $false
  } finally {
    $client.Dispose()
  }
}

if (-not $env:APPIUM_APK_PATH) {
  $env:APPIUM_APK_PATH = $releaseApk
}

$usesDefaultApk = [System.IO.Path]::GetFullPath($env:APPIUM_APK_PATH) -eq
  [System.IO.Path]::GetFullPath($releaseApk)

if ($usesDefaultApk) {
  if (-not (Test-Path $buildScript)) {
    throw "Android build script not found at '$buildScript'."
  }

  Write-Host "Building Appium release APK at $env:APPIUM_APK_PATH"
  & $buildScript
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
} elseif (-not (Test-Path $env:APPIUM_APK_PATH)) {
  throw "APPIUM_APK_PATH does not exist: '$env:APPIUM_APK_PATH'."
}

if (-not (Test-Path $adbPath)) {
  throw "adb not found at '$adbPath'. Install Android platform-tools or fix ANDROID_HOME / ANDROID_SDK_ROOT."
}

$devices = & $adbPath devices
$deviceLines = $devices | Select-String "`tdevice$"
if (-not $deviceLines) {
  throw 'No Android emulator/device is connected. Start an emulator before running Appium.'
}

$deviceApiLevel = (& $adbPath shell getprop ro.build.version.sdk).Trim()
if ([int]$deviceApiLevel -gt 36) {
  throw "Connected Android device uses API $deviceApiLevel. This app targets API 36, and the API 37 preview emulator leaves the Android starting-window reveal stuck, producing black or splash-only Appium screenshots. Run the tests on an API 36 emulator/device."
}

$backendUri = [Uri]$backendUrl
if (-not (Test-TcpEndpoint $backendUri)) {
  throw "Backend is not reachable at '$backendUrl'. Start the backend before Appium, or set APPIUM_API_URL to its host URL."
}
$env:APPIUM_API_URL = $backendUrl

# The Appium release APK always uses 127.0.0.1:8080 for its backend. Forward
# that device port to the selected backend port on Windows, avoiding
# Docker/host gateway binding differences that make 10.0.2.2 intermittent.
$appBackendPort = 8080
$backendPort = if ($backendUri.IsDefaultPort) {
  if ($backendUri.Scheme -eq 'https') { 443 } else { 80 }
} else {
  $backendUri.Port
}
& $adbPath reverse "tcp:$appBackendPort" "tcp:$backendPort"
if ($LASTEXITCODE -ne 0) {
  throw "Could not configure adb reverse from device port $appBackendPort to host port $backendPort."
}

# Keep the test device awake and avoid platform transition animations delaying
# or hiding the app window while Appium is taking screenshots.
& $adbPath shell input keyevent KEYCODE_WAKEUP | Out-Null
& $adbPath shell wm dismiss-keyguard | Out-Null
& $adbPath shell settings put global window_animation_scale 0 | Out-Null
& $adbPath shell settings put global transition_animation_scale 0 | Out-Null
& $adbPath shell settings put global animator_duration_scale 0 | Out-Null

Stop-StaleProcessOnPort ([int]$appiumPort)

$specFilter = if ($env:APPIUM_SPEC) { $env:APPIUM_SPEC } else { '*.test.ts' }
$specs = Get-ChildItem (Join-Path $root 'appium\tests') -Filter $specFilter |
  Sort-Object Name

if (-not $specs) {
  throw "No Appium specs matched filter '$specFilter'."
}

if (-not (Test-Path $appiumEntry)) {
  throw "Appium entry point not found at '$appiumEntry'. Run npm install."
}

New-Item -ItemType Directory -Force -Path $appiumLogsDir | Out-Null
$appiumJob = Start-Job -ScriptBlock {
  Set-Location $using:root
  & $using:nodeExe $using:appiumEntry server --address 127.0.0.1 --port $using:appiumPort 1>> $using:appiumStdoutLog 2>> $using:appiumStderrLog
}

try {
  $ready = $false
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 500

    if ($appiumJob.State -in @('Completed', 'Failed', 'Stopped')) {
      $stdout = if (Test-Path $appiumStdoutLog) { Get-Content $appiumStdoutLog -Raw } else { '' }
      $stderr = if (Test-Path $appiumStderrLog) { Get-Content $appiumStderrLog -Raw } else { '' }
      throw "Appium exited before becoming ready on port $appiumPort.`nSTDOUT:`n$stdout`nSTDERR:`n$stderr"
    }

    try {
      $response = Invoke-WebRequest -Uri "http://127.0.0.1:$appiumPort/status" -UseBasicParsing
      if ($response.StatusCode -eq 200) {
        $ready = $true
        break
      }
    } catch {
    }
  }

  if (-not $ready) {
    throw "Appium did not become ready on http://127.0.0.1:$appiumPort/status."
  }

  foreach ($spec in $specs) {
    Write-Host "Running Appium spec: $($spec.Name)"
    & npx.cmd wdio run appium/config.ts --spec $spec.FullName
    if ($LASTEXITCODE -ne 0) {
      exit $LASTEXITCODE
    }
  }
} finally {
  Stop-StaleProcessOnPort ([int]$appiumPort)
  if ($appiumJob) {
    Stop-Job -Job $appiumJob -ErrorAction SilentlyContinue
    Remove-Job -Job $appiumJob -ErrorAction SilentlyContinue
  }
}

exit 0
