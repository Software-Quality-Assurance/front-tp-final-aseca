function Get-AndroidSdkPath {
  $candidates = @(
    $env:ANDROID_HOME,
    $env:ANDROID_SDK_ROOT,
    (Join-Path $env:LOCALAPPDATA 'Android\Sdk'),
    'C:\Android\Sdk'
  ) | Where-Object { $_ } | Select-Object -Unique

  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  return $null
}

function Initialize-AndroidSdkEnvironment {
  $sdkPath = Get-AndroidSdkPath
  if (-not $sdkPath) {
    return $null
  }

  $env:ANDROID_HOME = $sdkPath
  $env:ANDROID_SDK_ROOT = $sdkPath

  $pathEntries = @(
    (Join-Path $sdkPath 'platform-tools'),
    (Join-Path $sdkPath 'emulator'),
    (Join-Path $sdkPath 'cmdline-tools\latest\bin')
  ) | Where-Object { Test-Path $_ }

  foreach ($entry in $pathEntries) {
    if (-not (($env:PATH -split ';') -contains $entry)) {
      $env:PATH = "$entry;$env:PATH"
    }
  }

  return $sdkPath
}
