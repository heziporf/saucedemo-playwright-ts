import { tags } from '@/config/tags';
import { timeouts } from '@/config/timeouts';
import { test } from '@/fixtures/index';
import { sortCases } from '@/test-data/cases/products.cases';
import { catalog, products } from '@/test-data/products.data';
import { users } from '@/test-data/users.data';

test.describe('Products', () => {
  test(
    'PRODUCTS-01: the catalog matches the product data and starts sorted A to Z',
    { tag: [tags.smoke, tags.regression] },
    async ({ loggedInPage }) => {
      await loggedInPage.assertProductsMatch(catalog);
      await loggedInPage.assertSortOptionSelected(loggedInPage.defaultSort);
      await loggedInPage.assertSortedBy('name', 'asc');
    },
  );

  for (const sortCase of sortCases) {
    test(
      `${sortCase.id}: ${sortCase.title}`,
      { tag: tags.regression },
      async ({ loggedInPage }) => {
        await loggedInPage.sortBy(sortCase.option);

        await loggedInPage.assertSortOptionSelected(sortCase.option);
        await loggedInPage.assertSortedBy(sortCase.by, sortCase.order);
        await loggedInPage.assertShowsExactly(catalog);
      },
    );
  }

  test(
    'PRODUCTS-05: product details match the card, and Back returns to Products',
    { tag: tags.regression },
    async ({ loggedInPage, productDetailsPage }) => {
      const { backpack } = products;

      await loggedInPage.productCard(backpack.name).openProductDetails();

      await productDetailsPage.assertOpened();
      await productDetailsPage.assertShowsProduct(backpack);

      await productDetailsPage.backToProducts();

      await loggedInPage.assertOpened();
    },
  );

  test(
    'PRODUCTS-06: performance_glitch_user still gets the full catalog',
    { tag: tags.regression },
    async ({ loginAs }) => {
      test.slow(true, 'this user is slowed down on purpose by the site');

      const inventoryPage = await loginAs(users.performance_glitch_user);

      await inventoryPage.assertProductCount(catalog.length, {
        timeout: timeouts.slowUserLogin,
      });
      await inventoryPage.assertOpened();
    },
  );
});
