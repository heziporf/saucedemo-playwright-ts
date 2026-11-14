import { routes } from '@/config/routes';
import { tags } from '@/config/tags';
import { test } from '@/fixtures/index';
import { protectedPageCases } from '@/test-data/cases/navigation.cases';
import { products } from '@/test-data/products.data';

test.describe('Logout & navigation', () => {
  test(
    'NAV-01: Logout returns to the login page',
    { tag: [tags.smoke, tags.regression] },
    async ({ loggedInPage, loginPage }) => {
      await loggedInPage.header.sideMenu.logout();

      await loginPage.assertLoggedOut();
    },
  );

  for (const pageCase of protectedPageCases) {
    test(
      `${pageCase.id}: ${pageCase.title}`,
      { tag: tags.regression },
      async ({ page, loginPage }) => {
        await page.goto(pageCase.path);

        await loginPage.assertAccessDenied(pageCase.path);
      },
    );
  }

  test(
    'NAV-04: the cart icon and the menu move between pages',
    { tag: tags.regression },
    async ({ loggedInPage, productDetailsPage, cartPage }) => {
      await loggedInPage.productCard(products.backpack.name).openProductDetails();

      await productDetailsPage.header.openCart();

      await cartPage.assertOpened();

      await cartPage.header.sideMenu.goToAllProducts();

      await loggedInPage.assertOpened();
    },
  );

  test(
    'NAV-05: the Back button after logout does not reopen a protected page',
    { tag: tags.regression },
    async ({ page, loggedInPage, cartPage, loginPage }) => {
      await loggedInPage.header.openCart();
      await cartPage.header.sideMenu.logout();

      await page.goBack();

      await loginPage.assertAccessDenied(routes.cart);
    },
  );

  test(
    'NAV-06: Reset App State empties the cart',
    { tag: tags.regression },
    async ({ loggedInPage, cartPage }) => {
      const selectedProducts = [products.backpack, products.onesie];
      await loggedInPage.addToCart(...selectedProducts);

      await loggedInPage.header.sideMenu.resetAppState();

      await loggedInPage.assertCartCount(0);
      await loggedInPage.header.openCart();
      await cartPage.assertCartIsEmpty();
    },
  );
});
