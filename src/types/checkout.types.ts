export interface CustomerDetails {
  readonly firstName: string;
  readonly lastName: string;
  readonly postalCode: string;
}

export interface OrderSummary {
  readonly itemTotal: number;
  readonly tax: number;
  readonly total: number;
}
