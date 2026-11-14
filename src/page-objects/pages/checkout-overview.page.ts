import type { Locator, Page } from '@playwright/test';
import { routes } from '@/config/routes';
import { PRICE_DECIMALS, parsePrice, roundToCents, sumPrices } from '@/helpers/price.helper';
import { step } from '@/helpers/step.decorator';
import { expect } from '@/matchers/index';
import { ProductCardComponent } from '@/page-objects/components/product-card.component';
import { TAX_RATE } from '@/test-data/checkout.data';
import type { OrderSummary } from '@/types/checkout.types';
import type { Product } from '@/types/product.types';
import { BasePage } from './base.page';

/** Checkout step 2: the ordered items and the price summary (item total, tax, total). */
export class CheckoutOverviewPage extends BasePage {
  readonly path = routes.checkoutOverview;
  readonly expectedTitle = 'Checkout: Overview';

  private readonly orderItems: Locator;
  private readonly itemTotal: Locator;
  private readonly tax: Locator;
  private readonly total: Locator;
  private readonly finishButton: Locator;
  private readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.orderItems = page.getByTestId(ProductCardComponent.testIds.card);
    this.itemTotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.cancelButton = page.getByTestId('cancel');
  }

  @step
  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }

  @step
  async cancelToProducts(): Promise<void> {
    await this.cancelButton.click();
  }

  @step
  async assertOrderItemsMatch(orderedProducts: readonly Product[]): Promise<void> {
    await expect(this.orderItems).toHaveCount(orderedProducts.length);
    expect
      .soft(await this.readOrderItems(), 'each order item matches the catalog')
      .toEqual(orderedProducts);
  }

  @step
  async assertOrderSummaryAddsUp(orderedProducts: readonly Product[]): Promise<void> {
    await expect
      .soft(this.itemTotal, 'item total = catalog prices')
      .toShowPrice(sumPrices(orderedProducts));
    const summary = await this.readOrderSummary();
    const orderItems = await this.readOrderItems();
    expect
      .soft(summary.itemTotal, 'item total = sum of the items shown')
      .toBeCloseTo(sumPrices(orderItems), PRICE_DECIMALS);
    expect
      .soft(summary.tax, `tax = ${TAX_RATE * 100}% of the item total`)
      .toBeCloseTo(roundToCents(summary.itemTotal * TAX_RATE), PRICE_DECIMALS);
    expect
      .soft(summary.total, 'total = item total + tax')
      .toBeCloseTo(roundToCents(summary.itemTotal + summary.tax), PRICE_DECIMALS);
  }

  private async readOrderItems(): Promise<Product[]> {
    return ProductCardComponent.readAllCards(this.orderItems);
  }

  private async readOrderSummary(): Promise<OrderSummary> {
    return {
      itemTotal: parsePrice(await this.itemTotal.innerText()),
      tax: parsePrice(await this.tax.innerText()),
      total: parsePrice(await this.total.innerText()),
    };
  }
}
