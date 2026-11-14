import { tags } from '@/config/tags';
import { test } from '@/fixtures/index';
import { requiredFieldCases } from '@/test-data/cases/checkout.cases';
import { validCustomer } from '@/test-data/checkout.data';
import { products } from '@/test-data/products.data';

const { backpack, bikeLight, fleeceJacket, onesie } = products;

test.describe('Checkout', () => {
  test(
    'CHECKOUT-01: a full order from cart to confirmation empties the cart',
    { tag: [tags.smoke, tags.regression] },
    async ({ startCheckoutWith, inventoryPage, checkoutOverviewPage, checkoutCompletePage }) => {
      const checkoutInfoPage = await startCheckoutWith(backpack, bikeLight);
      await checkoutInfoPage.fillCustomerDetails(validCustomer);
      await checkoutInfoPage.continueToOverview();

      await checkoutOverviewPage.finishOrder();

      await checkoutCompletePage.assertOpened();
      await checkoutCompletePage.assertOrderConfirmed();
      await checkoutCompletePage.assertCartCount(0);

      await checkoutCompletePage.backToProducts();

      await inventoryPage.assertOpened();
      await inventoryPage.assertCartCount(0);
    },
  );

  for (const fieldCase of requiredFieldCases) {
    test(
      `${fieldCase.id}: ${fieldCase.title}`,
      { tag: tags.regression },
      async ({ startCheckoutWith }) => {
        const checkoutInfoPage = await startCheckoutWith(backpack);
        await checkoutInfoPage.fillCustomerDetails(fieldCase.details);

        await checkoutInfoPage.continueToOverview();

        await checkoutInfoPage.assertErrorMessage(fieldCase.error);
        await checkoutInfoPage.assertOpened();
      },
    );
  }

  test(
    'CHECKOUT-05: the price summary adds up and matches the catalog prices',
    { tag: tags.regression },
    async ({ startCheckoutWith, checkoutOverviewPage }) => {
      const orderedProducts = [backpack, fleeceJacket, onesie];
      const checkoutInfoPage = await startCheckoutWith(...orderedProducts);
      await checkoutInfoPage.fillCustomerDetails(validCustomer);

      await checkoutInfoPage.continueToOverview();

      await checkoutOverviewPage.assertOpened();
      await checkoutOverviewPage.assertOrderItemsMatch(orderedProducts);
      await checkoutOverviewPage.assertOrderSummaryAddsUp(orderedProducts);
    },
  );

  test(
    'CHECKOUT-06: Cancel leaves checkout from each step and keeps the cart',
    { tag: tags.regression },
    async ({ startCheckoutWith, inventoryPage, cartPage, checkoutOverviewPage }) => {
      const checkoutInfoPage = await startCheckoutWith(backpack);

      await checkoutInfoPage.cancelToCart();

      await cartPage.assertOpened();

      await cartPage.startCheckout();
      await checkoutInfoPage.fillCustomerDetails(validCustomer);
      await checkoutInfoPage.continueToOverview();
      await checkoutOverviewPage.cancelToProducts();

      await inventoryPage.assertOpened();
      await inventoryPage.assertCartCount(1);
    },
  );
});
