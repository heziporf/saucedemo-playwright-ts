import type { Page } from '@playwright/test';
import type { Route } from '@/config/routes';
import { escapeRegExp } from '@/helpers/regexp.helper';
import { step } from '@/helpers/step.decorator';
import { expect } from '@/matchers/index';
import { HeaderComponent } from '@/page-objects/components/header.component';

/** The parts every logged-in page shares: header, opening, and the address/title/cart-badge checks. */
export abstract class BasePage {
  abstract readonly path: Route;
  abstract readonly expectedTitle: string | null;

  readonly header: HeaderComponent;

  constructor(readonly page: Page) {
    this.header = new HeaderComponent(page);
  }

  protected get urlPattern(): RegExp {
    return new RegExp(`${escapeRegExp(this.path)}$`);
  }

  @step
  async open(): Promise<void> {
    await this.page.goto(this.path);
  }

  @step
  async reload(): Promise<void> {
    await this.page.reload();
  }

  @step
  async goOffline(): Promise<void> {
    await this.page.context().setOffline(true);
  }

  async waitUntilOpened(): Promise<void> {
    await this.page.waitForURL(this.urlPattern);
    if (this.expectedTitle !== null) {
      await this.header.pageTitle.filter({ hasText: this.expectedTitle }).waitFor();
    }
  }

  @step
  async assertOpened(): Promise<void> {
    await expect(this.page, `address is ${this.path}`).toHaveURL(this.urlPattern);
    if (this.expectedTitle !== null) {
      await expect(this.header.pageTitle, `page title is "${this.expectedTitle}"`).toHaveText(
        this.expectedTitle,
      );
    }
  }

  @step
  async assertCartCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(
        this.header.cartBadge,
        'cart badge is removed when the cart is empty',
      ).toHaveCount(0);
      return;
    }
    await expect(this.header.cartBadge, `cart badge shows ${count}`).toHaveText(String(count));
  }

  @step
  async assertMatchesScreenshot(snapshotName: string): Promise<void> {
    await expect(this.page).toHaveScreenshot(snapshotName, { fullPage: true });
  }
}
