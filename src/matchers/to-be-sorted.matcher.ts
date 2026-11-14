import { expect as baseExpect } from '@playwright/test';
import type { SortOrder } from '@/types/product.types';

export const expect = baseExpect.extend({
  /** Passes when the list is in ascending or descending order (equal neighbours allowed). */
  toBeSorted(received: readonly (string | number)[], order: SortOrder) {
    const assertionName = 'toBeSorted';
    const firstOutOfOrderIndex = received.findIndex((value, index) => {
      const previous = received[index - 1];
      return previous !== undefined && !isInOrder(previous, value, order);
    });
    const pass = firstOutOfOrderIndex === -1;
    const hint = this.utils.matcherHint(assertionName, undefined, undefined, {
      isNot: this.isNot,
    });

    const message = pass
      ? (): string =>
          `${hint}\n\nExpected: not sorted ${order}\nReceived: ${this.utils.printReceived(received)}`
      : (): string =>
          `${hint}\n\nExpected: sorted ${order}\n` +
          `Order breaks at index ${firstOutOfOrderIndex}: ${this.utils.printReceived(received[firstOutOfOrderIndex - 1])} ` +
          `then ${this.utils.printReceived(received[firstOutOfOrderIndex])}\n` +
          `Received: ${this.utils.printReceived(received)}`;

    return { pass, message, name: assertionName, expected: order, actual: received };
  },
});

function isInOrder(previous: string | number, current: string | number, order: SortOrder): boolean {
  const comparison =
    typeof previous === 'number' && typeof current === 'number'
      ? previous - current
      : String(previous).localeCompare(String(current), 'en');
  return order === 'asc' ? comparison <= 0 : comparison >= 0;
}
