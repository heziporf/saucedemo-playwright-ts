import { existsSync } from 'node:fs';
import { config as loadDotenv } from 'dotenv';
import { ENV_EXAMPLE_FILE, ENV_FILE } from './paths';

loadEnvironmentFiles();

/** Settings from .env (or .env.example), checked once at start-up. */
export const env = Object.freeze({
  baseUrl: readUrl('BASE_URL'),
  password: readRequired('PASSWORD'),
  users: Object.freeze({
    standard: readRequired('STANDARD_USER'),
    lockedOut: readRequired('LOCKED_OUT_USER'),
    problem: readRequired('PROBLEM_USER'),
    performanceGlitch: readRequired('PERFORMANCE_GLITCH_USER'),
    error: readRequired('ERROR_USER'),
    visual: readRequired('VISUAL_USER'),
  }),
  api: Object.freeze({
    baseUrl: readUrl('API_BASE_URL'),
    username: readRequired('API_USERNAME'),
    password: readRequired('API_PASSWORD'),
  }),
  slowMo: readNonNegativeInteger('SLOW_MO'),
});

function loadEnvironmentFiles(): void {
  loadDotenv({ path: [ENV_FILE, ENV_EXAMPLE_FILE], quiet: true });
  if (!existsSync(ENV_FILE) && process.env.ENV_NOTICE_SHOWN === undefined) {
    process.env.ENV_NOTICE_SHOWN = 'true';
    console.log('[env] No .env file found, using the public defaults from .env.example');
  }
}

function readRequired(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing environment variable "${name}". Add it to .env (see .env.example).`);
  }
  return value;
}

function readUrl(name: string): string {
  const value = readRequired(name);
  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    throw new Error(`Environment variable "${name}" must be a valid URL, got "${value}".`);
  }
}

function readNonNegativeInteger(name: string): number {
  const value = Number(readRequired(name));
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Environment variable "${name}" must be a whole number >= 0.`);
  }
  return value;
}
