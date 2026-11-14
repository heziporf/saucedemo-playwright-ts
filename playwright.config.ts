import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';
import { ALLURE_RESULTS_DIR } from './src/config/paths';
import { timeouts } from './src/config/timeouts';

const isCI = !!process.env.CI;

const viewport = { width: 1280, height: 720 };
const ALLOWED_PIXEL_DIFFERENCE = 0.01;

const browserTests = ['ui/**/*.spec.ts', 'network/**/*.spec.ts'];

export default defineConfig({
  testDir: './tests',
  globalSetup: './src/config/global-setup.ts',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: 1,
  workers: isCI ? '50%' : undefined,
  timeout: timeouts.test,
  globalTimeout: timeouts.wholeRun,
  expect: {
    timeout: timeouts.expect,
    toHaveScreenshot: { maxDiffPixelRatio: ALLOWED_PIXEL_DIFFERENCE },
  },
  updateSnapshots: 'none',

  reporter: [
    isCI ? ['github'] : ['list'],
    ['html', { open: 'never', title: 'saucedemo E2E - Playwright report' }],
    ['allure-playwright', { resultsDir: ALLURE_RESULTS_DIR }],
  ],

  use: {
    baseURL: env.baseUrl,
    testIdAttribute: 'data-test',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    locale: 'en-US',
    actionTimeout: timeouts.action,
    navigationTimeout: timeouts.navigation,
    launchOptions: { slowMo: env.slowMo },
  },

  projects: [
    {
      name: 'setup',
      testMatch: 'setup/auth.setup.ts',
    },
    {
      name: 'chromium',
      testMatch: browserTests,
      use: { ...devices['Desktop Chrome'], viewport },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testMatch: browserTests,
      use: { ...devices['Desktop Firefox'], viewport },
      dependencies: ['setup'],
      default: false,
    },
    {
      name: 'webkit',
      testMatch: browserTests,
      use: { ...devices['Desktop Safari'], viewport },
      dependencies: ['setup'],
      default: false,
    },
    {
      name: 'api',
      testMatch: 'api/**/*.spec.ts',
      use: { baseURL: env.api.baseUrl },
      default: false,
    },
    {
      name: 'visual',
      testMatch: 'visual/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport },
      dependencies: ['setup'],
      default: false,
    },
  ],
});
