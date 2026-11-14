import { tags } from '@/config/tags';
import { test } from '@/fixtures/index';
import { catalog, products } from '@/test-data/products.data';

test.describe('Network', { tag: tags.regression }, () => {
  test('NET-01: every product image loads successfully', async ({ loggedInPage }) => {
    const imageResponses = await loggedInPage.recordProductImageResponses();

    await loggedInPage.reload();

    await loggedInPage.assertProductCount(catalog.length);
    await loggedInPage.assertAllImagesLoaded(imageResponses, catalog.length);
  });

  test('NET-02: shopping still works when product images are blocked', async ({ loggedInPage }) => {
    await loggedInPage.blockProductImages();

    await loggedInPage.reload();
    await loggedInPage.addToCart(products.backpack);

    await loggedInPage.assertProductCount(catalog.length);
    await loggedInPage.assertCartCount(1);
  });

  test('NET-03: moving between pages works offline once the app is loaded', async ({
    loggedInPage,
    cartPage,
  }) => {
    await loggedInPage.addToCart(products.backpack);
    await loggedInPage.goOffline();

    await loggedInPage.header.openCart();

    await cartPage.assertOpened();
    await cartPage.assertCartContains([products.backpack]);
  });
});
