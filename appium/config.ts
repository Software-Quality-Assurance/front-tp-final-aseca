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
  specs: ['./appium/tests/**/*.test.ts'],
  maxInstances: 1,

  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:app': APK_PATH,
      'appium:appPackage': 'com.anonymous.fronttpfinalaseca',
      'appium:appActivity': '.MainActivity',
      'appium:noReset': false,
      'appium:newCommandTimeout': 120,
    },
  ],

  logLevel: 'error' as const,
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: [
    [
      'appium',
      {
        args: { address: 'localhost', port: 4723 },
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
};
