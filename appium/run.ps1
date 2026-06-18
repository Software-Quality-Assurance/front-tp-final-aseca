$ErrorActionPreference = 'Stop'
. $PSScriptRoot\android-env.ps1

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$appiumCmd = Join-Path $root 'node_modules\.bin\appium.cmd'
$wdioCmd = Join-Path $root 'node_modules\.bin\wdio.cmd'
$logDir = Join-Path $root 'appium\logs'
$stdoutLog = Join-Path $logDir 'appium-stdout.log'
$stderrLog = Join-Path $logDir 'appium-stderr.log'
$appiumPort = if ($env:APPIUM_PORT) { $env:APPIUM_PORT } else { '4774' }
$sdkPath = Initialize-AndroidSdkEnvironment
$packageName = 'com.anonymous.fronttpfinalaseca'
$defaultApk = Join-Path $root 'android\app\build\outputs\apk\release\app-release.apk'
$apkPath = if ($env:APPIUM_APK_PATH) { $env:APPIUM_APK_PATH } else { $defaultApk }

if (-not (Test-Path $appiumCmd)) {
  throw "Appium binary not found at $appiumCmd. Run npm install."
}

if (-not (Test-Path $wdioCmd)) {
  throw "WDIO binary not found at $wdioCmd. Run npm install."
}

if (-not $sdkPath) {
  throw 'Android SDK not found. Install Android Studio / platform-tools or set ANDROID_HOME (or ANDROID_SDK_ROOT).'
}

$adbCommand = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adbCommand) {
  throw 'adb not found in PATH. Install Android platform-tools or fix ANDROID_HOME / ANDROID_SDK_ROOT.'
}

$devices = & adb devices
$deviceLines = $devices | Select-String "`tdevice$"
if (-not $deviceLines) {
  throw 'No Android emulator/device is connected. Start an emulator before running Appium.'
}

$hasApk = Test-Path $apkPath
$installedPackage = & adb shell pm list packages $packageName
$isInstalled = $installedPackage -match [regex]::Escape($packageName)

if (-not $hasApk -and -not $isInstalled) {
  throw "App '$packageName' is not installed on the emulator/device and no APK was found at '$apkPath'. Run `npm run android:build` or set APPIUM_APK_PATH."
}

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
if (Test-Path $stdoutLog) { Remove-Item -LiteralPath $stdoutLog -Force }
if (Test-Path $stderrLog) { Remove-Item -LiteralPath $stderrLog -Force }

$appiumProcess = Start-Process `
  -FilePath $appiumCmd `
  -ArgumentList @('server', '--address', '127.0.0.1', '--port', $appiumPort) `
  -WorkingDirectory $root `
  -WindowStyle Hidden `
  -RedirectStandardOutput $stdoutLog `
  -RedirectStandardError $stderrLog `
  -PassThru

try {
  $ready = $false
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 500

    if ($appiumProcess.HasExited) {
      $stdout = if (Test-Path $stdoutLog) { Get-Content $stdoutLog -Raw } else { '' }
      $stderr = if (Test-Path $stderrLog) { Get-Content $stderrLog -Raw } else { '' }
      throw "Appium exited before becoming ready.`nSTDOUT:`n$stdout`nSTDERR:`n$stderr"
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

  & $wdioCmd run (Join-Path $PSScriptRoot 'config.ts')
  exit $LASTEXITCODE
} finally {
  if ($appiumProcess -and -not $appiumProcess.HasExited) {
    Stop-Process -Id $appiumProcess.Id -Force
  }
}
