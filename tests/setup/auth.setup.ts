import { STANDARD_USER_SESSION_FILE } from '@/config/paths';
import { test as setup } from '@/fixtures/index';
import { catalog } from '@/test-data/products.data';
import { users } from '@/test-data/users.data';

setup(
  'log in as standard_user and save the session',
  async ({ page, loginPage, inventoryPage }) => {
    await loginPage.open();

    await loginPage.login(users.standard_user);

    await inventoryPage.assertOpened();
    await inventoryPage.assertProductCount(catalog.length);
    await page.context().storageState({ path: STANDARD_USER_SESSION_FILE });
  },
);
