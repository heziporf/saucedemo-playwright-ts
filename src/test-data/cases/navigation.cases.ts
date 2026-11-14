import { routes, type Route } from '@/config/routes';

interface ProtectedPageCase {
  readonly id: string;
  readonly title: string;
  readonly path: Route;
}

export const protectedPageCases: readonly ProtectedPageCase[] = [
  { id: 'NAV-02', title: 'Products cannot be opened without logging in', path: routes.inventory },
  { id: 'NAV-03', title: 'Cart cannot be opened without logging in', path: routes.cart },
];
