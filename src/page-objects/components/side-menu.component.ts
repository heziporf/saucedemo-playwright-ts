import type { Locator, Page } from '@playwright/test';
import { step } from '@/helpers/step.decorator';

/** The side menu: All Items, Logout and Reset App State. */
export class SideMenuComponent {
  private readonly openMenuButton: Locator;
  private readonly closeMenuButton: Locator;
  private readonly allProductsLink: Locator;
  private readonly logoutLink: Locator;
  private readonly resetAppStateLink: Locator;

  constructor(page: Page) {
    this.openMenuButton = page.getByRole('button', { name: 'Open Menu' });
    this.closeMenuButton = page.getByRole('button', { name: 'Close Menu' });
    this.allProductsLink = page.getByTestId('inventory-sidebar-link');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.resetAppStateLink = page.getByTestId('reset-sidebar-link');
  }

  @step
  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
  }

  @step
  async resetAppState(): Promise<void> {
    await this.openMenu();
    await this.resetAppStateLink.click();
    await this.closeMenuButton.click();
  }

  @step
  async goToAllProducts(): Promise<void> {
    await this.openMenu();
    await this.allProductsLink.click();
  }

  private async openMenu(): Promise<void> {
    await this.openMenuButton.click();
    await this.logoutLink.waitFor({ state: 'visible' });
  }
}
