import { mergeExpects } from '@playwright/test';
import { expect as sortExpect } from './to-be-sorted.matcher';
import { expect as priceExpect } from './to-show-price.matcher';

/** Playwright's `expect` plus the custom matchers toBeSorted and toShowPrice. */
export const expect = mergeExpects(sortExpect, priceExpect);
