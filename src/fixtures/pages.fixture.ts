import { test as base } from '@playwright/test';
import { CartPage } from '@/page-objects/pages/cart.page';
import { CheckoutCompletePage } from '@/page-objects/pages/checkout-complete.page';
import { CheckoutInfoPage } from '@/page-objects/pages/checkout-info.page';
import { CheckoutOverviewPage } from '@/page-objects/pages/checkout-overview.page';
import { InventoryPage } from '@/page-objects/pages/inventory.page';
import { LoginPage } from '@/page-objects/pages/login.page';
import { ProductDetailsPage } from '@/page-objects/pages/product-details.page';

interface PageFixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
  checkoutInfoPage: CheckoutInfoPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
}

/** Gives each test a ready page object for every page (loginPage, cartPage, …). */
export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  productDetailsPage: async ({ page }, use) => {
    await use(new ProductDetailsPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutInfoPage: async ({ page }, use) => {
    await use(new CheckoutInfoPage(page));
  },
  checkoutOverviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },
});
