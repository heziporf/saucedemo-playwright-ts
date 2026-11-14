import { tags } from '@/config/tags';
import { test } from '@/fixtures/index';
import { dummyJsonData } from '@/test-data/dummyjson.data';
import { INVALID_PASSWORD } from '@/test-data/users.data';
import type { ApiError } from '@/types/dummyjson.types';

const { user, knownProductId, unknownProductId, productPage, cart } = dummyJsonData;

test.describe('DummyJSON API', { tag: tags.api }, () => {
  test('API-01: a valid login returns tokens for that user', async ({ dummyJsonClient }) => {
    const response = await dummyJsonClient.login(user.username, user.password);

    await dummyJsonClient.assertLoginSucceeded(response, user.username);
  });

  test('API-02: a wrong password is rejected with 400', async ({ dummyJsonClient }) => {
    const response = await dummyJsonClient.login<ApiError>(user.username, INVALID_PASSWORD);

    await dummyJsonClient.assertLoginRejected(response);
  });

  test('API-03: a product has the expected shape and valid values', async ({ dummyJsonClient }) => {
    const response = await dummyJsonClient.getProduct(knownProductId);

    await dummyJsonClient.assertValidProduct(response, knownProductId);
  });

  test('API-04: paging returns the requested slice and only the requested fields', async ({
    dummyJsonClient,
  }) => {
    const response = await dummyJsonClient.listProducts(
      productPage.limit,
      productPage.skip,
      productPage.fields,
    );

    await dummyJsonClient.assertProductPage(response, productPage);
  });

  test('API-05: a cart total equals the product prices times quantities', async ({
    dummyJsonClient,
  }) => {
    const prices = await dummyJsonClient.readProductPrices(cart.lines.map((line) => line.id));

    const response = await dummyJsonClient.createCart(cart.userId, cart.lines);

    await dummyJsonClient.assertCartTotalMatches(response, cart.lines, prices);
  });

  test('API-06: an unknown product returns 404 with a clear message', async ({
    dummyJsonClient,
  }) => {
    const response = await dummyJsonClient.getProduct<ApiError>(unknownProductId);

    await dummyJsonClient.assertProductNotFound(response, unknownProductId);
  });
});
