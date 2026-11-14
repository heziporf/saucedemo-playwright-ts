import { mergeTests } from '@playwright/test';
import { test as apiTest } from './api.fixture';
import { test as sessionTest } from './session.fixture';

/** The `test` every spec imports: all page, session and API fixtures together. */
export const test = mergeTests(sessionTest, apiTest);
export { expect } from '@/matchers/index';
