import type { CustomerDetails } from '@/types/checkout.types';

export const validCustomer = {
  firstName: 'Dana',
  lastName: 'Levi',
  postalCode: '6100000',
} as const satisfies CustomerDetails;

export const whitespaceOnlyCustomer = {
  firstName: '   ',
  lastName: '   ',
  postalCode: '   ',
} as const satisfies CustomerDetails;

export const TAX_RATE = 0.08;
