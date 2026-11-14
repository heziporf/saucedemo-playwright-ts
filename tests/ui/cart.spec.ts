import { tags } from '@/config/tags';
import { test } from '@/fixtures/index';
import { products } from '@/test-data/products.data';

const { backpack, bikeLight, onesie } = products;

test.describe('Cart', () => {
  test(
    'CART-01: adding a product updates the badge and the button',
    { tag: [tags.smoke, tags.regression] },
    async ({ loggedInPage }) => {
      await loggedInPage.addToCart(backpack);

      await loggedInPage.assertCartCount(1);
      await loggedInPage.assertProductInCart(backpack);
    },
  );

  test(
    'CART-02: several products appear in the cart with their names, prices and quantities',
    { tag: tags.regression },
    async ({ loggedInPage, cartPage }) => {
      const selectedProducts = [backpack, bikeLight, onesie];
      await loggedInPage.addToCart(...selectedProducts);

      await loggedInPage.header.openCart();

      await cartPage.assertOpened();
      await cartPage.assertCartContains(selectedProducts);
      await cartPage.assertCartCount(selectedProducts.length);
    },
  );

  test(
    'CART-03: removing the last product empties the cart and removes the badge',
    { tag: tags.regression },
    async ({ loggedInPage, cartPage }) => {
      await loggedInPage.addToCart(backpack);
      await loggedInPage.header.openCart();

      await cartPage.cartItem(backpack.name).removeFromCart();

      await cartPage.assertCartIsEmpty();
    },
  );

  test(
    'CART-04: removing a product on the Products page updates the cart',
    { tag: tags.regression },
    async ({ loggedInPage, cartPage }) => {
      await loggedInPage.addToCart(backpack, bikeLight);

      await loggedInPage.productCard(backpack.name).removeFromCart();

      await loggedInPage.assertCartCount(1);
      await loggedInPage.header.openCart();
      await cartPage.assertCartContains([bikeLight]);
    },
  );

  test(
    'CART-05: the cart is kept after a reload and after moving between pages',
    { tag: tags.regression },
    async ({ loggedInPage, cartPage }) => {
      const selectedProducts = [backpack, bikeLight];
      await loggedInPage.addToCart(...selectedProducts);

      await loggedInPage.reload();

      await loggedInPage.assertCartCount(selectedProducts.length);
      await loggedInPage.assertProductInCart(backpack);

      await loggedInPage.header.openCart();
      await cartPage.header.sideMenu.goToAllProducts();

      await loggedInPage.assertOpened();
      await loggedInPage.assertCartCount(selectedProducts.length);
    },
  );

  test(
    'CART-06: Continue Shopping returns to Products with the cart unchanged',
    { tag: tags.regression },
    async ({ loggedInPage, cartPage }) => {
      await loggedInPage.addToCart(backpack);
      await loggedInPage.header.openCart();

      await cartPage.continueShopping();

      await loggedInPage.assertOpened();
      await loggedInPage.assertCartCount(1);
      await loggedInPage.assertProductInCart(backpack);
    },
  );
});
