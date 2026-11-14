import { expect as baseExpect, type Locator } from '@playwright/test';
import { parsePrice, PRICE_DECIMALS } from '@/helpers/price.helper';

function readAmountOrNaN(text: string): number {
  try {
    return parsePrice(text);
  } catch {
    return Number.NaN;
  }
}

export const expect = baseExpect.extend({
  /** Waits until the element shows the expected dollar amount (retries like a web-first check). */
  async toShowPrice(locator: Locator, expected: number, options?: { timeout?: number }) {
    const assertionName = 'toShowPrice';
    const timeout = options?.timeout ?? this.timeout;
    let actualText = '';
    const readShownAmount = async (): Promise<number> => {
      actualText = await locator.innerText({ timeout });
      return readAmountOrNaN(actualText);
    };

    let pass: boolean;
    try {
      if (this.isNot) {
        await baseExpect
          .poll(readShownAmount, { timeout })
          .not.toBeCloseTo(expected, PRICE_DECIMALS);
      } else {
        await baseExpect.poll(readShownAmount, { timeout }).toBeCloseTo(expected, PRICE_DECIMALS);
      }
      pass = !this.isNot;
    } catch {
      pass = this.isNot;
    }

    const message = (): string =>
      `${this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot })}\n\n` +
      `Locator: ${locator.toString()}\n` +
      `Expected: ${this.isNot ? 'not ' : ''}$${expected.toFixed(PRICE_DECIMALS)}\n` +
      `Received: ${this.utils.printReceived(actualText)}\n` +
      `Timeout: ${timeout}ms`;

    return { pass, message, name: assertionName, expected, actual: actualText };
  },
});
