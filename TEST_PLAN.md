# Test plan: saucedemo.com (Swag Labs)

| Area                           | Tests | IDs                                   | Spec file                                    |
| ------------------------------ | :---: | ------------------------------------- | -------------------------------------------- |
| 🔐 Login                       |   6   | LOGIN-01 – 06                         | `tests/ui/login.spec.ts`                     |
| 🛍️ Products                    |   6   | PRODUCTS-01 – 06                      | `tests/ui/products.spec.ts`                  |
| 🛒 Cart                        |   6   | CART-01 – 06                          | `tests/ui/cart.spec.ts`                      |
| 💳 Checkout                    |   6   | CHECKOUT-01 – 06                      | `tests/ui/checkout.spec.ts`                  |
| 🧭 Logout & navigation         |   6   | NAV-01 – 06                           | `tests/ui/navigation.spec.ts`                |
| 🐞 Known issues                |   6   | KI-01 – 06                            | `tests/ui/known-issues.spec.ts`              |
| ⭐ Bonus: network, API, visual |  15   | NET-01 – 03, API-01 – 06, VIS-01 – 06 | `tests/network`, `tests/api`, `tests/visual` |

**Contents:** 🎯 [Overview and scope](#-1-overview-and-scope) · 🧪 [Test cases](#-2-test-cases) · 📐 [In / out of scope](#-3-in-scope--out-of-scope) · 🔀 [Independence](#-4-test-independence--order-randomization) · 🐞 [Found bugs](#-5-found-bugs) · 🚩 [Risks](#-6-risks) · 📌 [Summary](#-7-summary)

## 🎯 1. Overview and scope

**Site under test:** [www.saucedemo.com](https://www.saucedemo.com), a demo web shop by Sauce Labs. A user logs in, browses six products, sorts them, opens product details, fills a cart and checks out in three steps (details → overview → confirmation). The site has built-in test accounts, some of which are broken on purpose:

| User                      | Behavior                                                                    |
| ------------------------- | --------------------------------------------------------------------------- |
| `standard_user`           | Works normally                                                              |
| `locked_out_user`         | Cannot log in                                                               |
| `problem_user`            | Broken images, sorting and checkout form                                    |
| `performance_glitch_user` | Login takes about 5 seconds                                                 |
| `error_user`              | Several actions throw errors (found on the site, not in the assignment)     |
| `visual_user`             | Visual defects and random prices (found on the site, not in the assignment) |

**Scope:** the five required areas (Login, Products, Cart, Checkout, Logout & Navigation), up to 6 tests each, plus known bugs, network behavior, an API suite (DummyJSON) and visual regression.

**Approach:**

- End-to-end through the real UI with Playwright Test 1.64.1 and TypeScript, Page Object Model, custom fixtures.
- Expected values come from an independent source: the catalog copied from the live site (`src/test-data/products.data.ts`) and the site's exact texts (in each page object's `text`). A test never compares the screen with itself.
- Every test starts from a fresh browser context and builds its own state, so tests run fully in parallel and in any order.
- Known bugs are tests of the correct behavior marked `test.fail`: green while the bug exists, red when it is fixed.

**Environment:** Chromium by default; Firefox and WebKit in CI. Headless by default, headed on demand. Fixed viewport 1280×720 and locale en-US. `retries: 1`; screenshot and video kept on failure; trace on the first retry.

**Priorities:** 🔴 **P1** = core flow, a failure blocks users (also tagged `@smoke`). 🟠 **P2** = important validation or behavior. 🟢 **P3** = secondary or edge case.

---

## 🧪 2. Test cases

### 🔐 Login (`tests/ui/login.spec.ts`)

| ID       | Description                       | Steps                                                 | Expected result                                                                                                       | Priority |
| -------- | --------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------- |
| LOGIN-01 | Valid login                       | 1. Open the login page 2. Log in as `standard_user`   | Products page opens (address + title "Products"); all 6 products are shown                                            | P1       |
| LOGIN-02 | Locked-out user                   | 1. Log in as `locked_out_user` 2. Click the error's X | "Epic sadface: Sorry, this user has been locked out."; the user stays on the login page; after X the error disappears | P1       |
| LOGIN-03 | Wrong password                    | Log in as `standard_user` with a wrong password       | "Epic sadface: Username and password do not match any user in this service"; still on the login page                  | P2       |
| LOGIN-04 | Username is case-sensitive (edge) | Log in as `Standard_User` with the correct password   | Same "do not match" error; no login                                                                                   | P3       |
| LOGIN-05 | Username required                 | Submit with an empty username                         | "Epic sadface: Username is required"                                                                                  | P2       |
| LOGIN-06 | Password required                 | Submit `standard_user` with an empty password         | "Epic sadface: Password is required"                                                                                  | P2       |

### 🛍️ Products (`tests/ui/products.spec.ts`)

| ID          | Description         | Steps                                                      | Expected result                                                                                                                                                       | Priority |
| ----------- | ------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| PRODUCTS-01 | Catalog display     | Open Products as `standard_user`                           | 6 cards; each card's name, description and price match the catalog; each image belongs to its product; default sort A→Z and the dropdown shows `az` (soft assertions) | P1       |
| PRODUCTS-02 | Sort Z→A            | Choose "Name (Z to A)"                                     | Names in descending order; the same 6 products                                                                                                                        | P2       |
| PRODUCTS-03 | Sort price low→high | Choose "Price (low to high)"                               | Prices ascending (equal prices allowed); the same 6 products                                                                                                          | P2       |
| PRODUCTS-04 | Sort price high→low | Choose "Price (high to low)"                               | Prices descending; the same 6 products                                                                                                                                | P2       |
| PRODUCTS-05 | Product details     | 1. Click "Sauce Labs Backpack" 2. Click "Back to products" | Details page shows the catalog name, description, price and an Add to cart button; Back returns to Products                                                           | P2       |
| PRODUCTS-06 | Slow user           | Log in as `performance_glitch_user`                        | All 6 products appear despite the ~5 s delay (longer timeout for this check only)                                                                                     | P3       |

### 🛒 Cart (`tests/ui/cart.spec.ts`)

| ID      | Description                    | Steps                                                                    | Expected result                                                                                         | Priority |
| ------- | ------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | -------- |
| CART-01 | Add a product                  | Click "Add to cart" on the Backpack                                      | Badge shows 1; the button changes to "Remove"                                                           | P1       |
| CART-02 | Several products in the cart   | 1. Add Backpack, Bike Light, Onesie 2. Open the cart                     | Badge 3; the cart lists the 3 products with catalog names and prices, quantity 1 each (soft assertions) | P1       |
| CART-03 | Remove the last product (edge) | 1. Add Backpack 2. Open the cart 3. Remove it                            | The cart is empty and the badge is gone (not "0")                                                       | P2       |
| CART-04 | Remove from the Products page  | 1. Add Backpack + Bike Light 2. Remove Backpack on Products              | Badge 1; the cart lists only the Bike Light                                                             | P2       |
| CART-05 | Cart persists                  | 1. Add 2 products 2. Reload 3. Open the cart 4. Go back through the menu | Badge 2 after reload and after navigating; buttons still show "Remove"                                  | P2       |
| CART-06 | Continue Shopping              | 1. Add Backpack 2. Open the cart 3. Click "Continue Shopping"            | Products page; badge 1; Backpack still shows "Remove"                                                   | P3       |

### 💳 Checkout (`tests/ui/checkout.spec.ts`)

| ID          | Description           | Steps                                                                     | Expected result                                                                                                                                  | Priority |
| ----------- | --------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| CHECKOUT-01 | Full order            | 1. Add 2 products 2. Cart → Checkout 3. Fill details → Continue 4. Finish | "Checkout: Complete!", "Thank you for your order!" and the dispatch text; the cart badge is gone                                                 | P1       |
| CHECKOUT-02 | First name required   | Continue with an empty first name                                         | "Error: First Name is required"; stays on step 1                                                                                                 | P2       |
| CHECKOUT-03 | Last name required    | Continue with an empty last name                                          | "Error: Last Name is required"; stays on step 1                                                                                                  | P2       |
| CHECKOUT-04 | Postal code required  | Continue with an empty postal code                                        | "Error: Postal Code is required"; stays on step 1                                                                                                | P2       |
| CHECKOUT-05 | Price summary         | Order Backpack, Fleece Jacket, Onesie; read the overview                  | Each line = catalog price; item total = sum of catalog prices = sum of lines; tax = 8% of item total; total = item total + tax (soft assertions) | P1       |
| CHECKOUT-06 | Cancel from each step | 1. Cancel on step 1 2. Checkout again, continue, Cancel on the overview   | Step 1 Cancel → cart; overview Cancel → Products; badge still 1                                                                                  | P3       |

### 🧭 Logout & navigation (`tests/ui/navigation.spec.ts`)

| ID     | Description           | Steps                                                                  | Expected result                                                                 | Priority |
| ------ | --------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------- |
| NAV-01 | Logout                | Menu → Logout                                                          | Login page, without an error                                                    | P1       |
| NAV-02 | Products is protected | Logged out, open `/inventory.html`                                     | Login page with "You can only access '/inventory.html' when you are logged in." | P1       |
| NAV-03 | Cart is protected     | Logged out, open `/cart.html`                                          | Login page with the same error for `/cart.html`                                 | P2       |
| NAV-04 | Move between pages    | 1. Open a product's details 2. Click the cart icon 3. Menu → All Items | The cart opens from the details page; All Items returns to Products             | P2       |
| NAV-05 | Back after logout     | 1. Open the cart 2. Log out 3. Press Back                              | Login form with "You can only access '/cart.html' …"; the cart is not shown     | P2       |
| NAV-06 | Reset App State       | 1. Add 2 products 2. Menu → Reset App State                            | Badge gone; the cart page is empty                                              | P3       |

### 🐞 Known issues (`tests/ui/known-issues.spec.ts`), each marked `test.fail`

Each test checks the **correct** behavior. Because the bug is still there, the check fails, and `test.fail()` reports that expected failure as passed. When a bug is fixed, its test turns red, as a signal to remove `test.fail()`.

| ID    | Description            | Steps                                             | Expected (correct) result                                                           | Priority |
| ----- | ---------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- |
| KI-01 | problem_user images    | Log in as `problem_user`                          | Each product shows its own image (actual: all `sl-404`)                             | P2       |
| KI-02 | problem_user sorting   | Choose "Name (Z to A)"                            | List sorted Z→A (actual: unchanged)                                                 | P2       |
| KI-03 | problem_user last name | Fill the checkout details                         | First and last name keep the typed values (actual: last name overwrites first name) | P1       |
| KI-04 | error_user sorting     | Choose "Name (Z to A)"                            | List sorted Z→A (actual: alert "Sorting is broken!", unchanged)                     | P2       |
| KI-05 | error_user finish      | Complete checkout and click Finish                | Confirmation page (actual: stays on the overview, JS error)                         | P1       |
| KI-06 | Blank details accepted | As `standard_user`, enter " " in all three fields | A validation error (actual: accepted)                                               | P2       |

### ⭐ Bonus suites

| ID        | Description                | Steps                                                                          | Expected result                                                | Priority |
| --------- | -------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------- | -------- |
| NET-01    | Product images load        | Reload Products and record image responses                                     | At least one response per product, all with status < 400       | P3       |
| NET-02    | Images blocked             | Block product image requests; reload; add to cart                              | Catalog still renders; badge 1                                 | P3       |
| NET-03    | Offline navigation         | Add a product; go offline; open the cart                                       | Cart opens with the product (client-side routing)              | P3       |
| API-01    | Valid login                | POST `/auth/login`                                                             | 200; username matches; access and refresh tokens               | P2       |
| API-02    | Wrong password             | POST `/auth/login` with a wrong password                                       | 400, "Invalid credentials"                                     | P2       |
| API-03    | Product shape              | GET `/products/1`                                                              | 200; id 1; non-empty title; positive price; whole-number stock | P3       |
| API-04    | Paging and field selection | GET `/products?limit=5&skip=10&select=title,price`                             | limit 5, skip 10, ids 11–15, only id/title/price               | P3       |
| API-05    | Cart total                 | Read the prices of products 1 and 2; POST `/carts/add` with quantities 2 and 1 | 201; 2 products, quantity 3; total = Σ price × quantity        | P2       |
| API-06    | Unknown product            | GET `/products/999999`                                                         | 404, "Product with id '999999' not found"                      | P3       |
| VIS-01–04 | Screens unchanged          | Login, Products, cart with 2 items, checkout overview                          | Match the Linux baselines                                      | P3       |
| VIS-05    | visual_user design         | Products as `visual_user` vs the standard baseline                             | Same design (actual: differs; `test.fail`)                     | P3       |
| VIS-06    | Products structure         | ARIA snapshot of the product list                                              | Same roles and names as the baseline                           | P3       |

---

## 📐 3. In scope / out of scope

**In scope:** login and its validation; catalog content, sorting, details; cart add / remove / persistence; checkout with validation and totals; logout, protected pages, Back button, Reset App State; behavior of the special users; Chromium, Firefox, WebKit at desktop size; DummyJSON API.

**Out of scope, and why:**

- Edge cases left out by the 6-tests-per-area limit: the checkout pages opened directly without logging in (the same rule as NAV-02/03); spaces around the username; very long or special-character input; a checkout address opened with an empty cart.
- The "Dynamic Catalog" pages (lazy-load, slider, spinner) and the order PDF download: newer site features outside the five requested areas.
- Mobile layouts, accessibility audits, performance measurement, security testing.
- The site's backend and payment: saucedemo has none (all logic runs in the browser).
- Second-order defects already listed below under "other findings".

---

## 🔀 4. Test independence & order randomization

Parallel execution requires that no test depends on another. Each test gets a fresh browser context; logged-in tests reuse only a saved session cookie (`auth.setup.ts`) and build everything else (cart, checkout) themselves.

This is verified with Playwright 1.64's `--shuffle`, which runs tests in a random order and prints a seed to replay it:

| Run | Command                                           | Seed      | Result                  |
| --- | ------------------------------------------------- | --------- | ----------------------- |
| 1   | `npm run test:shuffle` (1 worker, no retries)     | 664214884 | 40/40 passed            |
| 2   | `npm run test:shuffle`                            | 161568612 | 40/40 passed            |
| 3   | `npm run test:shuffle`                            | 598619413 | 40/40 passed            |
| 4   | `npm run test:shuffle:parallel` (5 workers)       | 118567573 | 40/40 passed            |
| —   | `npx playwright test --repeat-each=3` (flakiness) | —         | 118/118 passed, 0 flaky |

**Why `--retries=0`:** a retry could hide an order dependence (the test fails, then passes on retry). **Why one worker:** with one worker, tests run one after another in the shuffled order, so leftover state from one test would reach the next. The parallel shuffle covers tests running at the same time. CI runs a shuffled job on every push and prints its seed; a failing seed is replayed with `npx playwright test --shuffle <seed> --retries=0 --workers=1`.

---

## 🐞 5. Found bugs

| ID     | Severity | User          | Steps to reproduce                                           | Actual                                                                                | Expected                            | Test   |
| ------ | -------- | ------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------- | ----------------------------------- | ------ |
| BUG-01 | Medium   | problem_user  | Log in                                                       | Every product image is the same placeholder (`sl-404`)                                | Each product's own image            | KI-01  |
| BUG-02 | Medium   | problem_user  | Choose any sort option                                       | The list does not change                                                              | List sorted as chosen               | KI-02  |
| BUG-03 | High     | problem_user  | Checkout → type a first and last name                        | The last name replaces the first name; "Last Name is required" blocks checkout        | Both names kept; checkout continues | KI-03  |
| BUG-04 | Medium   | error_user    | Choose any sort option                                       | Alert "Sorting is broken! This error has been reported to Backtrace."; list unchanged | List sorted                         | KI-04  |
| BUG-05 | High     | error_user    | Complete checkout → Finish                                   | JS error `cesetRart is not a function`; order not placed                              | Confirmation page                   | KI-05  |
| BUG-06 | Medium   | standard_user | Checkout → enter " " (spaces) in all three fields → Continue | Accepted; overview opens                                                              | "… is required" error               | KI-06  |
| BUG-07 | Low      | visual_user   | Log in                                                       | First image broken, buttons misaligned, random prices                                 | Same as standard_user               | VIS-05 |

**Other findings** (seen on the live site, not automated because of the per-area limit):

- problem_user cannot add some products to the cart (3 clicks → badge shows 2).
- error_user can continue checkout with an empty last name; adding some products throws a JS error.
- Opening any page address directly returns HTTP 404 before the app redirects (static hosting with a single-page-app fallback).

---

## 🚩 6. Risks

| Risk                                         | Impact                                                  | Mitigation                                                                                                   |
| -------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| saucedemo is a live third-party site         | It can be slow, down or changed                         | `retries: 1`; failures keep a trace, video and screenshot; catalog data is dated so a site change is visible |
| Direct page loads return HTTP 404            | A status check would fail on a working page             | Tests check what the user sees, not response codes                                                           |
| Session cookie lasts 10 minutes              | A saved session could expire on a long run              | The setup project logs in fresh at the start of every run                                                    |
| DummyJSON is an outside service              | API tests could fail for reasons unrelated to saucedemo | API tests are a separate project, not part of `npm test`                                                     |
| Screenshots differ between operating systems | Visual tests would fail across machines                 | Baselines are made and compared only in the Linux Docker image                                               |
| Known-issue tests depend on deliberate bugs  | If the site fixes one, its test turns red               | Intended: the red test signals the fix; remove `test.fail` then                                              |

---

## 📌 7. Summary

- **51 automated tests:** 30 required (5 areas × 6), 6 known issues, 3 network, 6 API, 6 visual; plus one login setup.
- **Results:** all passing on Chromium and WebKit locally (Firefox in CI); 3 shuffled single-worker runs, a shuffled parallel run and a 3× repeat run with no failure or flake.
- **7 bugs found and proven by tests**, one of them (BUG-06) affecting the normal user.
- **Coverage:** every required flow, its validation messages and its edge cases within the 6-per-area limit; out-of-scope items are listed with reasons in section 3.
