$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$appiumCmd = Join-Path $root 'node_modules\.bin\appium.cmd'
$appiumPort = if ($env:APPIUM_PORT) { $env:APPIUM_PORT } else { '4774' }

if (-not (Test-Path $appiumCmd)) {
  throw "Appium binary not found at $appiumCmd. Run npm install."
}

& $appiumCmd server --address 127.0.0.1 --port $appiumPort
