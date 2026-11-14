export const routes = {
  login: '/',
  inventory: '/inventory.html',
  productDetails: '/inventory-item.html',
  cart: '/cart.html',
  checkoutInfo: '/checkout-step-one.html',
  checkoutOverview: '/checkout-step-two.html',
  checkoutComplete: '/checkout-complete.html',
} as const;

export type Route = (typeof routes)[keyof typeof routes];
