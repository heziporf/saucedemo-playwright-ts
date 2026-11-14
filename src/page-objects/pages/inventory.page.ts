import type { Locator, Page } from '@playwright/test';
import { routes } from '@/config/routes';
import { parsePrice } from '@/helpers/price.helper';
import { step } from '@/helpers/step.decorator';
import { expect } from '@/matchers/index';
import { ProductCardComponent } from '@/page-objects/components/product-card.component';
import type { ResponseRecord } from '@/types/network.types';
import type { Product, SortField, SortOption, SortOrder } from '@/types/product.types';
import { BasePage } from './base.page';

const FIRST_ERROR_STATUS = 400;

/** The Products page: the catalog, sorting, adding to the cart, and the checks on them. */
export class InventoryPage extends BasePage {
  readonly path = routes.inventory;
  readonly expectedTitle = 'Products';
  readonly defaultSort: SortOption = 'az';

  private readonly productList: Locator;
  private readonly productCards: Locator;
  private readonly sortDropdown: Locator;
  private readonly productNames: Locator;
  private readonly productPrices: Locator;
  private readonly productImageUrl = /\/assets\/.*\.jpg$/;

  constructor(page: Page) {
    super(page);
    this.productList = page.getByTestId('inventory-container');
    this.productCards = page.getByTestId(ProductCardComponent.testIds.card);
    this.sortDropdown = page.getByTestId('product-sort-container');
    this.productNames = this.productCards.getByTestId(ProductCardComponent.testIds.name);
    this.productPrices = this.productCards.getByTestId(ProductCardComponent.testIds.price);
  }

  productCard(name: string): ProductCardComponent {
    return ProductCardComponent.withName(this.productCards, name);
  }

  @step
  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  @step
  async addToCart(...products: readonly Product[]): Promise<void> {
    for (const product of products) {
      await this.productCard(product.name).addToCart();
    }
  }

  @step
  async blockProductImages(): Promise<void> {
    await this.page.route(this.productImageUrl, (route) => route.abort());
  }

  @step
  async recordProductImageResponses(): Promise<ResponseRecord[]> {
    await this.page.route(this.productImageUrl, (route) => route.continue());
    const records: ResponseRecord[] = [];
    this.page.on('response', (response) => {
      if (this.productImageUrl.test(response.url())) {
        records.push({ url: response.url(), status: response.status() });
      }
    });
    return records;
  }

  @step
  async assertProductCount(expectedCount: number, options?: { timeout?: number }): Promise<void> {
    await expect(this.productCards, 'all catalog products are shown').toHaveCount(
      expectedCount,
      options,
    );
  }

  @step
  async assertProductsMatch(expectedProducts: readonly Product[]): Promise<void> {
    await this.assertProductCount(expectedProducts.length);
    expect
      .soft(await this.readAllProducts(), 'every card matches the catalog')
      .toEqual(expect.arrayContaining([...expectedProducts]));
    for (const product of expectedProducts) {
      await expect
        .soft(this.productCard(product.name).image, `${product.name} has its own image`)
        .toHaveAttribute('alt', product.name);
    }
  }

  @step
  async assertSortOptionSelected(option: SortOption): Promise<void> {
    await expect(this.sortDropdown).toHaveValue(option);
  }

  @step
  async assertSortedBy(by: SortField, order: SortOrder): Promise<void> {
    const readShownValues = (): Promise<readonly (string | number)[]> =>
      by === 'name' ? this.getProductNames() : this.getProductPrices();
    await expect
      .poll(readShownValues, { message: `products are sorted by ${by}, ${order}` })
      .toBeSorted(order);
  }

  @step
  async assertShowsExactly(expectedProducts: readonly Product[]): Promise<void> {
    expect(
      (await this.getProductNames()).toSorted(),
      'exactly the catalog products are shown',
    ).toEqual(expectedProducts.map((product) => product.name).toSorted());
  }

  @step
  async assertProductInCart(product: Product): Promise<void> {
    const card = this.productCard(product.name);
    await expect(card.removeButton, `"${product.name}" shows "Remove"`).toBeVisible();
    await expect(card.addToCartButton).toBeHidden();
  }

  @step
  async assertProductImagesAreReal(products: readonly Product[]): Promise<void> {
    for (const product of products) {
      await expect(
        this.productCard(product.name).image,
        `${product.name} shows a real image`,
      ).not.toHaveAttribute('src', /sl-404/);
    }
  }

  @step
  async assertAllImagesLoaded(
    responses: readonly ResponseRecord[],
    expectedCount: number,
  ): Promise<void> {
    await expect
      .poll(() => responses.length, { message: 'one image response per product' })
      .toBeGreaterThanOrEqual(expectedCount);
    for (const response of responses) {
      expect.soft(response.status, `${response.url} loads`).toBeLessThan(FIRST_ERROR_STATUS);
    }
  }

  @step
  async assertProductListStructure(snapshotName: string): Promise<void> {
    await expect(this.productList).toMatchAriaSnapshot({ name: snapshotName });
  }

  private async getProductNames(): Promise<string[]> {
    return this.productNames.allInnerTexts();
  }

  private async getProductPrices(): Promise<number[]> {
    return (await this.productPrices.allInnerTexts()).map(parsePrice);
  }

  private async readAllProducts(): Promise<Product[]> {
    return ProductCardComponent.readAllCards(this.productCards);
  }
}
