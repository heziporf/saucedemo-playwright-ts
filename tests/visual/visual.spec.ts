import { tags } from '@/config/tags';
import { test } from '@/fixtures/index';
import { validCustomer } from '@/test-data/checkout.data';
import { catalog, products } from '@/test-data/products.data';
import { users } from '@/test-data/users.data';

const screenshots = {
  login: 'login.png',
  products: 'products.png',
  cart: 'cart.png',
  checkoutOverview: 'checkout-overview.png',
  productListStructure: 'products.aria.yml',
} as const;

test.describe('Visual', { tag: tags.visual }, () => {
  test('VIS-01: login page', async ({ loginPage }) => {
    await loginPage.open();

    await loginPage.assertOpened();
    await loginPage.assertMatchesScreenshot(screenshots.login);
  });

  test('VIS-02: products page', async ({ loggedInPage }) => {
    await loggedInPage.waitUntilOpened();

    await loggedInPage.assertProductCount(catalog.length);
    await loggedInPage.assertMatchesScreenshot(screenshots.products);
  });

  test('VIS-03: cart with two products', async ({ loggedInPage, cartPage }) => {
    const selectedProducts = [products.backpack, products.bikeLight];
    await loggedInPage.addToCart(...selectedProducts);

    await loggedInPage.header.openCart();

    await cartPage.assertCartContains(selectedProducts);
    await cartPage.assertMatchesScreenshot(screenshots.cart);
  });

  test('VIS-04: checkout overview', async ({ startCheckoutWith, checkoutOverviewPage }) => {
    const checkoutInfoPage = await startCheckoutWith(products.backpack, products.bikeLight);
    await checkoutInfoPage.fillCustomerDetails(validCustomer);

    await checkoutInfoPage.continueToOverview();

    await checkoutOverviewPage.assertOpened();
    await checkoutOverviewPage.assertMatchesScreenshot(screenshots.checkoutOverview);
  });

  test(
    'VIS-05: visual_user products page matches the standard design',
    {
      tag: tags.knownBug,
      annotation: { type: 'issue', description: 'BUG-07: visual_user layout' },
    },
    async ({ loginAs }) => {
      test.fail(
        true,
        'BUG-07: visual_user shows a broken image, shifted buttons and random prices',
      );

      const inventoryPage = await loginAs(users.visual_user);

      await inventoryPage.assertProductCount(catalog.length);
      await inventoryPage.assertMatchesScreenshot(screenshots.products);
    },
  );

  test('VIS-06: products page structure (ARIA snapshot)', async ({ loggedInPage }) => {
    await loggedInPage.waitUntilOpened();

    await loggedInPage.assertProductCount(catalog.length);
    await loggedInPage.assertProductListStructure(screenshots.productListStructure);
  });
});
