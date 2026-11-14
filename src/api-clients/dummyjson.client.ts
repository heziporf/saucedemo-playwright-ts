import { test, type APIRequestContext, type APIResponse } from '@playwright/test';
import { PRICE_DECIMALS, roundToCents } from '@/helpers/price.helper';
import { step } from '@/helpers/step.decorator';
import { expect } from '@/matchers/index';
import type {
  ApiCart,
  ApiCartLineRequest,
  ApiError,
  ApiLoginResponse,
  ApiProduct,
  ApiProductPage,
} from '@/types/dummyjson.types';

const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const jwtFormat = /^[\w-]+\.[\w-]+\.[\w-]+$/;

interface ProductPageRequest {
  readonly limit: number;
  readonly skip: number;
  readonly fields: readonly string[];
}

/** Requests to the DummyJSON demo API and the checks on its responses. */
export class DummyJsonClient {
  readonly text = {
    errors: {
      invalidCredentials: 'Invalid credentials',
      productNotFound: (id: number): string => `Product with id '${id}' not found`,
    },
  } as const;

  private readonly endpoints = {
    login: '/auth/login',
    products: '/products',
    product: (id: number): string => `/products/${id}`,
    addCart: '/carts/add',
  } as const;

  constructor(private readonly request: APIRequestContext) {}

  async login<ResponseBody = ApiLoginResponse>(
    username: string,
    password: string,
  ): Promise<APIResponse<ResponseBody>> {
    return test.step(
      'DummyJsonClient.login',
      () => this.request.post<ResponseBody>(this.endpoints.login, { data: { username, password } }),
      { box: true },
    );
  }

  async getProduct<ResponseBody = ApiProduct>(id: number): Promise<APIResponse<ResponseBody>> {
    return test.step(
      'DummyJsonClient.getProduct',
      () => this.request.get<ResponseBody>(this.endpoints.product(id)),
      { box: true },
    );
  }

  @step
  async listProducts(
    limit: number,
    skip: number,
    fields: readonly string[],
  ): Promise<APIResponse<ApiProductPage>> {
    return this.request.get<ApiProductPage>(this.endpoints.products, {
      params: { limit, skip, select: fields.join(',') },
    });
  }

  @step
  async readProductPrices(ids: readonly number[]): Promise<number[]> {
    return Promise.all(ids.map(async (id) => (await (await this.getProduct(id)).json()).price));
  }

  @step
  async createCart(
    userId: number,
    lines: readonly ApiCartLineRequest[],
  ): Promise<APIResponse<ApiCart>> {
    return this.request.post<ApiCart>(this.endpoints.addCart, {
      data: { userId, products: lines },
    });
  }

  @step
  async assertLoginSucceeded(
    response: APIResponse<ApiLoginResponse>,
    username: string,
  ): Promise<void> {
    expect(response.status()).toBe(HTTP_OK);
    const body = await response.json();
    expect.soft(body.username).toBe(username);
    expect.soft(body.accessToken, 'the access token is a JWT').toMatch(jwtFormat);
    expect.soft(body.refreshToken, 'a refresh token is returned').not.toBe('');
  }

  @step
  async assertLoginRejected(response: APIResponse<ApiError>): Promise<void> {
    expect(response.status()).toBe(HTTP_BAD_REQUEST);
    expect((await response.json()).message).toBe(this.text.errors.invalidCredentials);
  }

  @step
  async assertValidProduct(response: APIResponse<ApiProduct>, expectedId: number): Promise<void> {
    expect(response.status()).toBe(HTTP_OK);
    const product = await response.json();
    expect.soft(product.id).toBe(expectedId);
    expect.soft(product.title.trim(), 'the title is not empty').not.toBe('');
    expect.soft(product.price, 'price is a positive number').toBeGreaterThan(0);
    expect.soft(Number.isInteger(product.stock), 'stock is a whole number').toBe(true);
  }

  @step
  async assertProductPage(
    response: APIResponse<ApiProductPage>,
    request: ProductPageRequest,
  ): Promise<void> {
    expect(response.status()).toBe(HTTP_OK);
    const page = await response.json();
    const expectedIds = Array.from(
      { length: request.limit },
      (_, index) => request.skip + index + 1,
    );
    expect.soft(page.limit).toBe(request.limit);
    expect.soft(page.skip).toBe(request.skip);
    expect
      .soft(
        page.products.map((product) => product.id),
        'ids follow the skip',
      )
      .toEqual(expectedIds);
    for (const product of page.products) {
      expect
        .soft(Object.keys(product).toSorted(), 'only the requested fields')
        .toEqual(['id', ...request.fields].toSorted());
    }
  }

  @step
  async assertCartTotalMatches(
    response: APIResponse<ApiCart>,
    lines: readonly ApiCartLineRequest[],
    prices: readonly number[],
  ): Promise<void> {
    expect(response.status()).toBe(HTTP_CREATED);
    const cart = await response.json();
    const expectedTotal = roundToCents(
      lines.reduce((sum, line, index) => sum + (prices[index] ?? 0) * line.quantity, 0),
    );
    const expectedQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);
    expect.soft(cart.totalProducts).toBe(lines.length);
    expect.soft(cart.totalQuantity).toBe(expectedQuantity);
    expect
      .soft(cart.total, 'total = price x quantity, summed')
      .toBeCloseTo(expectedTotal, PRICE_DECIMALS);
  }

  @step
  async assertProductNotFound(response: APIResponse<ApiError>, id: number): Promise<void> {
    expect(response.status()).toBe(HTTP_NOT_FOUND);
    expect((await response.json()).message).toBe(this.text.errors.productNotFound(id));
  }
}
