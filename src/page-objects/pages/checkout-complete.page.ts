import type { Locator, Page } from '@playwright/test';
import { routes } from '@/config/routes';
import { step } from '@/helpers/step.decorator';
import { expect } from '@/matchers/index';
import { BasePage } from './base.page';

/** Checkout step 3: the order confirmation. */
export class CheckoutCompletePage extends BasePage {
  readonly path = routes.checkoutComplete;
  readonly expectedTitle = 'Checkout: Complete!';

  readonly text = {
    confirmationTitle: 'Thank you for your order!',
    confirmationBody:
      'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
  } as const;

  private readonly confirmationTitle: Locator;
  private readonly confirmationBody: Locator;
  private readonly backToProductsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.confirmationTitle = page.getByTestId('complete-header');
    this.confirmationBody = page.getByTestId('complete-text');
    this.backToProductsButton = page.getByTestId('back-to-products');
  }

  @step
  async backToProducts(): Promise<void> {
    await this.backToProductsButton.click();
    await this.page.waitForURL(`**${routes.inventory}`);
  }

  @step
  async assertOrderConfirmed(): Promise<void> {
    await expect(this.confirmationTitle).toHaveText(this.text.confirmationTitle);
    await expect(this.confirmationBody).toHaveText(this.text.confirmationBody);
  }
}
