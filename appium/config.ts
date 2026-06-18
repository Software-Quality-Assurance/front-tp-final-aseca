import path from 'path';
import fs from 'fs';

if (process.platform === 'win32') {
  process.env.JAVA_HOME ||= 'C:\\Program Files\\Android\\Android Studio\\jbr';
  process.env.ANDROID_HOME ||= path.join(
    process.env.LOCALAPPDATA ?? '',
    'Android',
    'Sdk'
  );
  process.env.ANDROID_SDK_ROOT ||= process.env.ANDROID_HOME;
}

const APK_PATH =
  process.env.APPIUM_APK_PATH ??
  path.resolve(
    __dirname,
    '../android/app/build/outputs/apk/release/app-release.apk'
  );

const API_URL = process.env.APPIUM_API_URL ?? 'http://localhost:8080';
const APPIUM_PORT = Number(process.env.APPIUM_PORT ?? '4774');

export const config = {
  runner: 'local' as const,
  hostname: '127.0.0.1',
  port: APPIUM_PORT,
  specs: ['./tests/**/*.test.ts'],
  maxInstances: 1,
  maxInstancesPerCapability: 1,

  capabilities: [
    {
      maxInstances: 1,
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:app': APK_PATH,
      'appium:appPackage': 'com.anonymous.fronttpfinalaseca',
      'appium:appActivity': '.MainActivity',
      'appium:noReset': false,
      'appium:fullReset': false,
      'appium:enforceAppInstall': true,
      'appium:autoGrantPermissions': true,
      'appium:disableWindowAnimation': true,
      'appium:newCommandTimeout': 120,
    },
  ],

  logLevel: 'info' as const,
  waitforTimeout: 30000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: 'mocha' as const,
  reporters: ['spec'] as const,
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },

  env: { apiUrl: API_URL },

  // Capture a screenshot whenever a test or hook fails
  afterTest: async function (
    _test: any,
    _context: any,
    { error }: { error?: Error }
  ) {
    if (error) {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const dir = path.resolve(__dirname, '../appium/screenshots');
      const file = path.join(dir, `fail-${ts}.png`);
      try {
        fs.mkdirSync(dir, { recursive: true });
        await (browser as any).saveScreenshot(file);
        console.log(`Screenshot saved: ${file}`);
      } catch (e) {
        console.error('Could not save screenshot:', e);
      }
    }
  },
};
