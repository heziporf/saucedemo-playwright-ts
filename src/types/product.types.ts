export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export type SortOrder = 'asc' | 'desc';

export type SortField = 'name' | 'price';

export interface Product {
  readonly name: string;
  readonly description: string;
  readonly price: number;
}
