import type { Locator, Page } from '@playwright/test';
import { routes } from '@/config/routes';
import { escapeRegExp } from '@/helpers/regexp.helper';
import { step } from '@/helpers/step.decorator';
import { expect } from '@/matchers/index';
import { ProductCardComponent } from '@/page-objects/components/product-card.component';
import type { Product } from '@/types/product.types';
import { BasePage } from './base.page';

/** One product's details page, opened from the Products page. */
export class ProductDetailsPage extends BasePage {
  readonly path = routes.productDetails;
  readonly expectedTitle = null;

  private readonly product: ProductCardComponent;
  private readonly backToProductsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.product = new ProductCardComponent(page.getByTestId(ProductCardComponent.testIds.card));
    this.backToProductsButton = page.getByTestId('back-to-products');
  }

  protected override get urlPattern(): RegExp {
    return new RegExp(`${escapeRegExp(this.path)}\\?id=\\d+$`);
  }

  @step
  async backToProducts(): Promise<void> {
    await this.backToProductsButton.click();
    await this.page.waitForURL(`**${routes.inventory}`);
  }

  @step
  override async assertOpened(): Promise<void> {
    await super.assertOpened();
    await expect(this.backToProductsButton, 'the "Back to products" button is shown').toBeVisible();
  }

  @step
  async assertShowsProduct(expected: Product): Promise<void> {
    await expect.soft(this.product.name).toHaveText(expected.name);
    await expect.soft(this.product.description).toHaveText(expected.description);
    await expect.soft(this.product.price).toShowPrice(expected.price);
    await expect.soft(this.product.addToCartButton).toBeVisible();
  }
}
