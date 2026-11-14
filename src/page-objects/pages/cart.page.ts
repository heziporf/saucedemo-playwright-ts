import type { Locator, Page } from '@playwright/test';
import { routes } from '@/config/routes';
import { step } from '@/helpers/step.decorator';
import { expect } from '@/matchers/index';
import { ProductCardComponent } from '@/page-objects/components/product-card.component';
import type { Product } from '@/types/product.types';
import { BasePage } from './base.page';

/** The cart page: its items, Checkout / Continue Shopping, and the checks on them. */
export class CartPage extends BasePage {
  readonly path = routes.cart;
  readonly expectedTitle = 'Your Cart';

  private readonly cartItems: Locator;
  private readonly cartItemQuantities: Locator;
  private readonly checkoutButton: Locator;
  private readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.getByTestId(ProductCardComponent.testIds.card);
    this.cartItemQuantities = this.cartItems.getByTestId(ProductCardComponent.testIds.quantity);
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
  }

  cartItem(name: string): ProductCardComponent {
    return ProductCardComponent.withName(this.cartItems, name);
  }

  @step
  async startCheckout(): Promise<void> {
    await this.checkoutButton.click();
    await this.page.waitForURL(`**${routes.checkoutInfo}`);
  }

  @step
  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
    await this.page.waitForURL(`**${routes.inventory}`);
  }

  @step
  async assertCartContains(expectedProducts: readonly Product[]): Promise<void> {
    await expect(this.cartItems).toHaveCount(expectedProducts.length);
    expect
      .soft(await this.readCartItems(), 'cart items match the catalog')
      .toEqual(expectedProducts);
    await expect
      .soft(this.cartItemQuantities, 'each product is in the cart once')
      .toHaveText(expectedProducts.map(() => '1'));
  }

  @step
  async assertCartIsEmpty(): Promise<void> {
    await expect(this.cartItems, 'the cart has no items').toHaveCount(0);
    await this.assertCartCount(0);
  }

  private async readCartItems(): Promise<Product[]> {
    return ProductCardComponent.readAllCards(this.cartItems);
  }
}
