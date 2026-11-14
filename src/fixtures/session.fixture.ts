import { STANDARD_USER_SESSION_FILE } from '@/config/paths';
import { expect } from '@/matchers/index';
import type { CheckoutInfoPage } from '@/page-objects/pages/checkout-info.page';
import type { InventoryPage } from '@/page-objects/pages/inventory.page';
import type { Product } from '@/types/product.types';
import type { User } from '@/types/user.types';
import { test as pagesTest } from './pages.fixture';

interface SessionOptions {
  /** Fail the test on any uncaught JavaScript error in the page (on by default). */
  failOnPageError: boolean;
}

interface SessionFixtures {
  /** The Products page, already logged in as standard_user with the saved session. */
  loggedInPage: InventoryPage;
  /** Logs in through the login form as the given user and returns the Products page. */
  loginAs: (user: User) => Promise<InventoryPage>;
  /** Adds the products to the cart, opens checkout step 1 and returns that page. */
  startCheckoutWith: (...products: readonly Product[]) => Promise<CheckoutInfoPage>;
}

export const test = pagesTest.extend<SessionOptions & SessionFixtures>({
  failOnPageError: [true, { option: true }],

  page: async ({ page, failOnPageError }, use) => {
    const uncaughtErrors: string[] = [];
    page.on('pageerror', (error) => uncaughtErrors.push(error.message));
    await use(page);
    if (failOnPageError) {
      expect(uncaughtErrors, 'the page threw no uncaught JavaScript errors').toEqual([]);
    }
  },

  loggedInPage: async ({ context, inventoryPage }, use) => {
    await context.setStorageState(STANDARD_USER_SESSION_FILE);
    await inventoryPage.open();
    await inventoryPage.waitUntilOpened();
    await use(inventoryPage);
  },

  loginAs: async ({ loginPage, inventoryPage }, use) => {
    await use(async (user: User) => {
      await loginPage.open();
      await loginPage.login(user);
      return inventoryPage;
    });
  },

  startCheckoutWith: async ({ loggedInPage, cartPage, checkoutInfoPage }, use) => {
    await use(async (...products: readonly Product[]) => {
      await loggedInPage.addToCart(...products);
      await loggedInPage.header.openCart();
      await cartPage.startCheckout();
      await checkoutInfoPage.waitUntilOpened();
      return checkoutInfoPage;
    });
  },
});
