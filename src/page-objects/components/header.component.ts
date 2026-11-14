import type { Locator, Page } from '@playwright/test';
import { routes } from '@/config/routes';
import { step } from '@/helpers/step.decorator';
import { SideMenuComponent } from './side-menu.component';

/** The top bar on every logged-in page: page title, cart icon and badge, side menu. */
export class HeaderComponent {
  readonly pageTitle: Locator;
  readonly cartBadge: Locator;
  readonly sideMenu: SideMenuComponent;

  private readonly cartLink: Locator;

  constructor(page: Page) {
    this.pageTitle = page.getByTestId('title');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.sideMenu = new SideMenuComponent(page);
    this.cartLink = page.getByTestId('shopping-cart-link');
  }

  @step
  async openCart(): Promise<void> {
    await this.cartLink.click();
    await this.cartLink.page().waitForURL(`**${routes.cart}`);
  }
}
