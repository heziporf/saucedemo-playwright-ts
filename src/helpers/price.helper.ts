export const PRICE_DECIMALS = 2;

export function parsePrice(text: string): number {
  const match = /\$(\d+(?:\.\d{1,2})?)/.exec(text);
  if (!match?.[1]) {
    throw new Error(`No dollar amount found in "${text}"`);
  }
  return Number(match[1]);
}

export function roundToCents(amount: number): number {
  const centsPerDollar = 10 ** PRICE_DECIMALS;
  return Math.round(amount * centsPerDollar) / centsPerDollar;
}

export function sumPrices(items: readonly { readonly price: number }[]): number {
  return roundToCents(items.reduce((sum, item) => sum + item.price, 0));
}
