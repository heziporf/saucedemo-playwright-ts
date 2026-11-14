import { tags } from '@/config/tags';
import { test } from '@/fixtures/index';
import { validCustomer, whitespaceOnlyCustomer } from '@/test-data/checkout.data';
import { catalog, products } from '@/test-data/products.data';
import { users } from '@/test-data/users.data';

test.describe('Known issues', { tag: tags.knownBug }, () => {
  test.use({ failOnPageError: false });

  test(
    'KI-01: problem_user sees the right image for every product',
    {
      annotation: {
        type: 'issue',
        description: 'BUG-01: every product shows the same broken image',
      },
    },
    async ({ loginAs }) => {
      test.fail(true, 'BUG-01: every product image is the placeholder "sl-404"');

      const inventoryPage = await loginAs(users.problem_user);

      await inventoryPage.assertOpened();
      await inventoryPage.assertProductImagesAreReal(catalog);
    },
  );

  test(
    'KI-02: problem_user can sort products Z to A',
    { annotation: { type: 'issue', description: 'BUG-02: sorting has no effect' } },
    async ({ loginAs }) => {
      test.fail(true, 'BUG-02: choosing a sort option leaves the list unchanged');
      const inventoryPage = await loginAs(users.problem_user);

      await inventoryPage.sortBy('za');

      await inventoryPage.assertSortedBy('name', 'desc');
    },
  );

  test(
    'KI-03: problem_user can type a last name at checkout',
    { annotation: { type: 'issue', description: 'BUG-03: Last Name typing goes into First Name' } },
    async ({ loginAs, cartPage, checkoutInfoPage }) => {
      test.fail(
        true,
        'BUG-03: the last name overwrites the first name, so checkout cannot continue',
      );
      const inventoryPage = await loginAs(users.problem_user);
      await inventoryPage.addToCart(products.backpack);
      await inventoryPage.header.openCart();
      await cartPage.startCheckout();

      await checkoutInfoPage.fillCustomerDetails(validCustomer);

      await checkoutInfoPage.assertFieldValues(validCustomer);
    },
  );

  test(
    'KI-04: error_user can sort products Z to A',
    { annotation: { type: 'issue', description: 'BUG-04: sorting shows an error alert' } },
    async ({ page, loginAs }) => {
      test.fail(true, 'BUG-04: sorting shows "Sorting is broken!" and the list stays unsorted');
      const inventoryPage = await loginAs(users.error_user);
      page.once('dialog', (dialog) => void dialog.dismiss());

      await inventoryPage.sortBy('za');

      await inventoryPage.assertSortedBy('name', 'desc');
    },
  );

  test(
    'KI-05: error_user can finish an order',
    { annotation: { type: 'issue', description: 'BUG-05: Finish does nothing' } },
    async ({ loginAs, cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage }) => {
      test.fail(
        true,
        'BUG-05: clicking Finish throws a JavaScript error and the order is not placed',
      );
      const inventoryPage = await loginAs(users.error_user);
      await inventoryPage.addToCart(products.backpack);
      await inventoryPage.header.openCart();
      await cartPage.startCheckout();
      await checkoutInfoPage.fillCustomerDetails(validCustomer);
      await checkoutInfoPage.continueToOverview();

      await checkoutOverviewPage.finishOrder();

      await checkoutCompletePage.assertOpened();
    },
  );

  test(
    'KI-06: checkout rejects customer details made only of spaces',
    { annotation: { type: 'issue', description: 'BUG-06: blank-looking names pass validation' } },
    async ({ startCheckoutWith }) => {
      test.fail(true, 'BUG-06: spaces are accepted as first name, last name and postal code');
      const checkoutInfoPage = await startCheckoutWith(products.backpack);
      await checkoutInfoPage.fillCustomerDetails(whitespaceOnlyCustomer);

      await checkoutInfoPage.continueToOverview();

      await checkoutInfoPage.assertValidationErrorShown();
      await checkoutInfoPage.assertOpened();
    },
  );
});
