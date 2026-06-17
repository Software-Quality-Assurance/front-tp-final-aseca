import path from 'path';

const APK_PATH =
  process.env.APPIUM_APK_PATH ??
  path.resolve(
    __dirname,
    '../android/app/build/outputs/apk/debug/app-debug.apk'
  );

const API_URL = process.env.APPIUM_API_URL ?? 'http://localhost:8080';

export const config = {
  runner: 'local' as const,
  hostname: '127.0.0.1',
  port: 4723,
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
      'appium:fullReset': true,
      'appium:newCommandTimeout': 120,
    },
  ],

  logLevel: 'info' as const,
  waitforTimeout: 30000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: [
    [
      'appium',
      {
        args: { address: '127.0.0.1', port: 4723 },
        command: 'node_modules/.bin/appium',
      },
    ],
  ],

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
      const file = path.resolve(
        __dirname,
        `../appium/screenshots/fail-${ts}.png`
      );
      try {
        await (browser as any).saveScreenshot(file);
        console.log(`Screenshot saved: ${file}`);
      } catch (e) {
        console.error('Could not save screenshot:', e);
      }
    }
  },
};

