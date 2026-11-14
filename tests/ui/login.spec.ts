import { tags } from '@/config/tags';
import { test } from '@/fixtures/index';
import { loginErrorCases } from '@/test-data/cases/login.cases';
import { catalog } from '@/test-data/products.data';
import { users } from '@/test-data/users.data';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test(
    'LOGIN-01: standard_user logs in and lands on Products',
    { tag: [tags.smoke, tags.regression] },
    async ({ loginPage, inventoryPage }) => {
      await loginPage.login(users.standard_user);

      await inventoryPage.assertOpened();
      await inventoryPage.assertProductCount(catalog.length);
    },
  );

  test(
    'LOGIN-02: locked_out_user is blocked, and the error can be closed',
    { tag: tags.regression },
    async ({ loginPage }) => {
      await loginPage.login(users.locked_out_user);

      await loginPage.assertErrorMessage('lockedOut');
      await loginPage.assertOpened();

      await loginPage.closeErrorMessage();

      await loginPage.assertErrorClosed();
    },
  );

  for (const loginCase of loginErrorCases) {
    test(`${loginCase.id}: ${loginCase.title}`, { tag: tags.regression }, async ({ loginPage }) => {
      await loginPage.login(loginCase.user);

      await loginPage.assertErrorMessage(loginCase.error);
      await loginPage.assertOpened();
    });
  }
});
