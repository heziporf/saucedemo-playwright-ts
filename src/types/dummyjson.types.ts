export interface ApiProduct {
  readonly id: number;
  readonly title: string;
  readonly price: number;
  readonly stock: number;
}

export interface ApiProductPage {
  readonly products: readonly Pick<ApiProduct, 'id' | 'title' | 'price'>[];
  readonly skip: number;
  readonly limit: number;
}

export interface ApiLoginResponse {
  readonly username: string;
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface ApiCartLineRequest {
  readonly id: number;
  readonly quantity: number;
}

export interface ApiCart {
  readonly total: number;
  readonly totalProducts: number;
  readonly totalQuantity: number;
}

export interface ApiError {
  readonly message: string;
}
