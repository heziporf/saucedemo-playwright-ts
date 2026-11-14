import type { Locator, Page } from '@playwright/test';
import { routes } from '@/config/routes';
import { step } from '@/helpers/step.decorator';
import { expect } from '@/matchers/index';
import type { CustomerDetails } from '@/types/checkout.types';
import { BasePage } from './base.page';

export type CheckoutErrorKey = keyof CheckoutInfoPage['text']['errors'];

/** Checkout step 1: the customer details form and its validation errors. */
export class CheckoutInfoPage extends BasePage {
  readonly path = routes.checkoutInfo;
  readonly expectedTitle = 'Checkout: Your Information';

  readonly text = {
    errors: {
      firstNameRequired: 'Error: First Name is required',
      lastNameRequired: 'Error: Last Name is required',
      postalCodeRequired: 'Error: Postal Code is required',
    },
  } as const;

  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly errorMessage: Locator;
  private readonly continueButton: Locator;
  private readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.errorMessage = page.getByTestId('error');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
  }

  @step
  async fillCustomerDetails(details: CustomerDetails): Promise<void> {
    await this.firstNameInput.fill(details.firstName);
    await this.lastNameInput.fill(details.lastName);
    await this.postalCodeInput.fill(details.postalCode);
  }

  @step
  async continueToOverview(): Promise<void> {
    await this.continueButton.click();
  }

  @step
  async cancelToCart(): Promise<void> {
    await this.cancelButton.click();
  }

  @step
  async assertErrorMessage(error: CheckoutErrorKey): Promise<void> {
    await expect(this.errorMessage).toHaveText(this.text.errors[error]);
  }

  @step
  async assertValidationErrorShown(): Promise<void> {
    await expect(this.errorMessage, 'a validation error is shown').toBeVisible();
  }

  @step
  async assertFieldValues(details: CustomerDetails): Promise<void> {
    await expect(this.firstNameInput).toHaveValue(details.firstName);
    await expect(this.lastNameInput).toHaveValue(details.lastName);
    await expect(this.postalCodeInput).toHaveValue(details.postalCode);
  }
}
