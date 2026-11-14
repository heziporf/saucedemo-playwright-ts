import { test as base } from '@playwright/test';
import { DummyJsonClient } from '@/api-clients/dummyjson.client';

interface ApiFixtures {
  dummyJsonClient: DummyJsonClient;
}

/** Gives each API test a DummyJsonClient. */
export const test = base.extend<ApiFixtures>({
  dummyJsonClient: async ({ request }, use) => {
    await use(new DummyJsonClient(request));
  },
});
