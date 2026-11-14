import type { SortField, SortOption, SortOrder } from '@/types/product.types';

interface SortCase {
  readonly id: string;
  readonly title: string;
  readonly option: SortOption;
  readonly by: SortField;
  readonly order: SortOrder;
}

export const sortCases: readonly SortCase[] = [
  { id: 'PRODUCTS-02', title: 'sorting by Name (Z to A)', option: 'za', by: 'name', order: 'desc' },
  {
    id: 'PRODUCTS-03',
    title: 'sorting by Price (low to high)',
    option: 'lohi',
    by: 'price',
    order: 'asc',
  },
  {
    id: 'PRODUCTS-04',
    title: 'sorting by Price (high to low)',
    option: 'hilo',
    by: 'price',
    order: 'desc',
  },
];
