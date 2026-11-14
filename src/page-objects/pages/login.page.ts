import type { Locator, Page } from '@playwright/test';
import { routes, type Route } from '@/config/routes';
import { step } from '@/helpers/step.decorator';
import { expect } from '@/matchers/index';
import type { User } from '@/types/user.types';

export type LoginErrorKey = Exclude<keyof LoginPage['text']['errors'], 'notLoggedIn'>;

/** The login page: logging in, the error message, and the checks on both. */
export class LoginPage {
  readonly text = {
    errors: {
      lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
      credentialsMismatch:
        'Epic sadface: Username and password do not match any user in this service',
      usernameRequired: 'Epic sadface: Username is required',
      passwordRequired: 'Epic sadface: Password is required',
      notLoggedIn: (path: string): string =>
        `Epic sadface: You can only access '${path}' when you are logged in.`,
    },
  } as const;

  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly closeErrorButton: Locator;

  constructor(readonly page: Page) {
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error');
    this.closeErrorButton = page.getByTestId('error-button');
  }

  @step
  async open(): Promise<void> {
    await this.page.goto(routes.login);
  }

  @step
  async login(user: User): Promise<void> {
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.loginButton.click();
  }

  @step
  async closeErrorMessage(): Promise<void> {
    await this.closeErrorButton.click();
  }

  @step
  async assertOpened(): Promise<void> {
    await expect(this.loginButton, 'login form is shown').toBeVisible();
    await expect(this.usernameInput).toBeEditable();
  }

  @step
  async assertErrorMessage(error: LoginErrorKey): Promise<void> {
    await expect(this.errorMessage).toHaveText(this.text.errors[error]);
  }

  @step
  async assertErrorClosed(): Promise<void> {
    await expect(this.errorMessage, 'the error is gone after closing it').toBeHidden();
  }

  @step
  async assertLoggedOut(): Promise<void> {
    await this.assertOpened();
    await expect(this.errorMessage, 'a normal logout shows no error').toBeHidden();
  }

  @step
  async assertAccessDenied(path: Route): Promise<void> {
    await this.assertOpened();
    await expect(this.errorMessage).toHaveText(this.text.errors.notLoggedIn(path));
  }

  @step
  async assertMatchesScreenshot(snapshotName: string): Promise<void> {
    await expect(this.page).toHaveScreenshot(snapshotName, { fullPage: true });
  }
}
