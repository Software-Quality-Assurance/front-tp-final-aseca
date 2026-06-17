import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const DEFAULT_APK_PATH = path.join(
  ROOT_DIR,
  'android',
  'app',
  'build',
  'outputs',
  'apk',
  'debug',
  'app-debug.apk'
);
const APPIUM_BIN = path.join(
  ROOT_DIR,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'appium.cmd' : 'appium'
);
const configuredApkPath = process.env.APPIUM_APK_PATH ?? DEFAULT_APK_PATH;
const hasApkBinary = fs.existsSync(configuredApkPath);
const useInstalledApp = !hasApkBinary;
const appiumCapabilities: Record<string, string | number | boolean> = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:appPackage': 'com.anonymous.fronttpfinalaseca',
  'appium:appActivity': '.MainActivity',
  'appium:noReset': useInstalledApp,
  'appium:newCommandTimeout': 120,
};

if (hasApkBinary) {
  appiumCapabilities['appium:app'] = configuredApkPath;
}

const API_URL = process.env.APPIUM_API_URL ?? 'http://localhost:8080';

export const config = {
  runner: 'local' as const,
  specs: [path.join(__dirname, 'tests', '**', '*.test.ts')],
  maxInstances: 1,
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',

  capabilities: [appiumCapabilities],

  logLevel: 'error' as const,
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: 'mocha' as const,
  reporters: ['spec'] as const,
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },

  env: { apiUrl: API_URL },
  beforeSession: () => {
    if (!fs.existsSync(APPIUM_BIN)) {
      throw new Error(`Appium binary not found at ${APPIUM_BIN}. Run npm install.`);
    }

    if (!hasApkBinary) {
      console.warn(
        [
          `[appium] APK not found at ${configuredApkPath}.`,
          '[appium] The test run will use the installed app on the emulator/device instead.',
          '[appium] If the app is not installed yet, run `npm run android` once or set APPIUM_APK_PATH to a built APK.',
        ].join('\n')
      );
    }
  },
};
