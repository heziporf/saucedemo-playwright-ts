import path from 'node:path';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
export const ENV_FILE = path.join(PROJECT_ROOT, '.env');
export const ENV_EXAMPLE_FILE = path.join(PROJECT_ROOT, '.env.example');
export const STANDARD_USER_SESSION_FILE = path.join(
  PROJECT_ROOT,
  'playwright/.auth/standard-user.json',
);
export const ALLURE_RESULTS_DIR = path.join(PROJECT_ROOT, 'allure-results');
