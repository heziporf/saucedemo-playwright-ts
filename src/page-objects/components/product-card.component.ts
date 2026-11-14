import type { Locator } from '@playwright/test';
import { routes } from '@/config/routes';
import { parsePrice } from '@/helpers/price.helper';
import { step } from '@/helpers/step.decorator';
import type { Product } from '@/types/product.types';

/** One product as shown on the Products, details, cart and checkout pages. */
export class ProductCardComponent {
  static readonly testIds = {
    card: 'inventory-item',
    name: 'inventory-item-name',
    description: 'inventory-item-desc',
    price: 'inventory-item-price',
    quantity: 'item-quantity',
  } as const;

  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly image: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;

  constructor(private readonly root: Locator) {
    const { testIds } = ProductCardComponent;
    this.name = root.getByTestId(testIds.name);
    this.description = root.getByTestId(testIds.description);
    this.price = root.getByTestId(testIds.price);
    this.image = root.getByRole('img');
    this.addToCartButton = root.getByRole('button', { name: 'Add to cart' });
    this.removeButton = root.getByRole('button', { name: 'Remove' });
  }

  static withName(cards: Locator, name: string): ProductCardComponent {
    const nameMatch = cards.page().getByTestId(ProductCardComponent.testIds.name).getByText(name, {
      exact: true,
    });
    return new ProductCardComponent(cards.filter({ has: nameMatch }));
  }

  static async readAllCards(cards: Locator): Promise<Product[]> {
    const products: Product[] = [];
    for (const card of await cards.all()) {
      products.push(await new ProductCardComponent(card).readProduct());
    }
    return products;
  }

  @step
  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  @step
  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
  }

  @step
  async openProductDetails(): Promise<void> {
    await this.name.click();
    await this.root.page().waitForURL(`**${routes.productDetails}?id=*`);
  }

  private async readProduct(): Promise<Product> {
    return {
      name: await this.name.innerText(),
      description: await this.description.innerText(),
      price: parsePrice(await this.price.innerText()),
    };
  }
}
