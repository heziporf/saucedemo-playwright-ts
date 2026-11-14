import type { CheckoutErrorKey } from '@/page-objects/pages/checkout-info.page';
import { validCustomer } from '@/test-data/checkout.data';
import type { CustomerDetails } from '@/types/checkout.types';

interface CheckoutFieldCase {
  readonly id: string;
  readonly title: string;
  readonly details: CustomerDetails;
  readonly error: CheckoutErrorKey;
}

export const requiredFieldCases: readonly CheckoutFieldCase[] = [
  {
    id: 'CHECKOUT-02',
    title: 'checkout stops when the first name is empty',
    details: { ...validCustomer, firstName: '' },
    error: 'firstNameRequired',
  },
  {
    id: 'CHECKOUT-03',
    title: 'checkout stops when the last name is empty',
    details: { ...validCustomer, lastName: '' },
    error: 'lastNameRequired',
  },
  {
    id: 'CHECKOUT-04',
    title: 'checkout stops when the postal code is empty',
    details: { ...validCustomer, postalCode: '' },
    error: 'postalCodeRequired',
  },
];
