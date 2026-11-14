import { env } from '@/config/env';
import type { ApiCartLineRequest } from '@/types/dummyjson.types';
import type { User } from '@/types/user.types';

export const dummyJsonData = {
  user: { username: env.api.username, password: env.api.password } satisfies User,
  knownProductId: 1,
  unknownProductId: 999_999,
  productPage: { limit: 5, skip: 10, fields: ['title', 'price'] },
  cart: {
    userId: 1,
    lines: [
      { id: 1, quantity: 2 },
      { id: 2, quantity: 1 },
    ] satisfies readonly ApiCartLineRequest[],
  },
} as const;
