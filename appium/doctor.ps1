$ErrorActionPreference = 'Stop'
. $PSScriptRoot\android-env.ps1

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$defaultApk = Join-Path $root 'android\app\build\outputs\apk\release\app-release.apk'
$apkPath = if ($env:APPIUM_APK_PATH) { $env:APPIUM_APK_PATH } else { $defaultApk }
$appiumCmd = Join-Path $root 'node_modules\.bin\appium.cmd'
$packageName = 'com.anonymous.fronttpfinalaseca'
$sdkPath = Initialize-AndroidSdkEnvironment

function Write-Check($label, $value) {
  Write-Host ("{0,-18} {1}" -f $label, $value)
}

Write-Host 'Appium doctor'
Write-Host '-------------'
Write-Check 'Workspace' $root
Write-Check 'Appium bin' $(if (Test-Path $appiumCmd) { $appiumCmd } else { 'missing' })
Write-Check 'APK path' $(if (Test-Path $apkPath) { $apkPath } else { 'missing' })
Write-Check 'Android SDK' $(if ($sdkPath) { $sdkPath } else { 'missing' })

try {
  $adbCommand = Get-Command adb -ErrorAction Stop
  Write-Check 'adb' $adbCommand.Source
} catch {
  Write-Check 'adb' 'missing from PATH'
  Write-Host ''
  Write-Host 'Install Android Studio / platform-tools and make sure the SDK exists in the default path or set ANDROID_HOME.'
  exit 1
}

$devices = & adb devices
Write-Host ''
Write-Host $devices

$deviceLines = $devices | Select-String "`tdevice$"
if (-not $deviceLines) {
  Write-Host ''
  Write-Host 'No Android emulator/device is connected.'
  Write-Host 'Start an emulator from Android Studio or connect a device with USB debugging enabled.'
  exit 1
}

$installedPackage = & adb shell pm list packages $packageName
Write-Host ''
Write-Check 'Installed app' $(if ($installedPackage -match [regex]::Escape($packageName)) { 'yes' } else { 'no' })

if (-not ($installedPackage -match [regex]::Escape($packageName)) -and -not (Test-Path $apkPath)) {
  Write-Host ''
  Write-Host 'The app is not installed and no APK was found.'
  Write-Host 'Run `npm run android:build` to create the bundled release APK, or set APPIUM_APK_PATH.'
  exit 1
}

Write-Host ''
Write-Host 'Environment looks ready for `npm run test:appium`.'
