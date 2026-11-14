# saucedemo E2E tests: Playwright + TypeScript

[![Playwright tests](https://github.com/heziporf/saucedemo-playwright-ts/actions/workflows/playwright.yml/badge.svg)](https://github.com/heziporf/saucedemo-playwright-ts/actions/workflows/playwright.yml)
[![Report](https://img.shields.io/badge/report-HTML%20%2B%20Allure-blue)](https://heziporf.github.io/saucedemo-playwright-ts/)

End-to-end test automation for [saucedemo.com](https://www.saucedemo.com) ("Swag Labs"), a demo web shop with a login, a product catalog, a cart, a checkout and deliberately broken users.

| Suite                        | Tests | In `npm test` | Command                          |
| ---------------------------- | :---: | :-----------: | -------------------------------- |
| 🧪 Required UI (5 areas × 6) |  30   |      ✅       | `npm test`                       |
| 🐞 Known issues (real bugs)  |   6   |      ✅       | `npm test`                       |
| 🌐 Network                   |   3   |      ✅       | `npm test`                       |
| 🔌 API (DummyJSON)           |   6   |       —       | `npm run test:api`               |
| 🖼️ Visual + ARIA snapshot    |   6   |       —       | `npm run test:visual` (Linux/CI) |

- 📊 **Live reports:** [HTML report](https://heziporf.github.io/saucedemo-playwright-ts/) and [Allure report](https://heziporf.github.io/saucedemo-playwright-ts/allure/), published by CI on every push to `master`.

---

## 🚀 Quick start (3 steps)

```bash
git clone https://github.com/heziporf/saucedemo-playwright-ts.git && cd saucedemo-playwright-ts
npm install
npm test
```

That's all. `npm install` also downloads Chromium, and no `.env` is needed (see [Environment](#-environment)). You should see `40 passed`: the 30 required tests, the 6 known issues (expected failures count as passed), 3 network tests and the login setup. The 6 known-issue tests show a red ✘ in the list: that is their expected failure (a real bug still on the site), so they count as passed.

If your network blocks the automatic browser download, run `npx playwright install chromium` once, then `npm test`.

---

## 📋 Prerequisites

- **Node.js 22.18 or newer** (CI tests 22 and 24; developed on 24.7). `.nvmrc` pins 24 (the current LTS) for `nvm use`. Node 20 reached end of life in April 2026.
- **npm** (comes with Node.js).
- Internet access to `www.saucedemo.com` (and `dummyjson.com` for the API suite).

## ⚙️ Setup

1. **Clone:** `git clone https://github.com/heziporf/saucedemo-playwright-ts.git`
2. **Install:** `npm install` (installs packages and Chromium). For Firefox and WebKit too: `npx playwright install`.
3. **Environment (optional):** `cp .env.example .env` (Windows: `copy .env.example .env`), then edit `.env`.

### 🔐 Environment

- **`.env`** holds your settings. It is **git-ignored, so it is never uploaded** to the repository.
- **`.env.example`** is the committed template, with every key. Because all values here are **public demo values** (saucedemo prints its test accounts on its login page; DummyJSON publishes its demo account), the template holds the **real, working values**, not placeholders. A `.env` created with `cp .env.example .env` starts exactly the same; edit it to change any value.

| Key                                            | Meaning                                                           |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| `BASE_URL`                                     | Site under test, `https://www.saucedemo.com`                      |
| `STANDARD_USER` … `VISUAL_USER`, `PASSWORD`    | The site's public test accounts and their shared password         |
| `API_BASE_URL`, `API_USERNAME`, `API_PASSWORD` | Public DummyJSON demo API and its demo account                    |
| `SLOW_MO`                                      | Milliseconds between actions, to watch a headed run (default `0`) |

Values are read in this order: real environment variables (e.g. CI), then `.env`, then `.env.example` for anything missing. So a fresh clone runs even before `.env` is created; the run then prints one line saying the template values were used. Every value is validated at start-up (`src/config/env.ts`), and a missing or malformed value stops the run with a clear message.

---

## ▶️ Running the tests

| What                                           | Command                                          |
| ---------------------------------------------- | ------------------------------------------------ |
| All UI tests, Chromium, **headless** (default) | `npm test`                                       |
| Same, **headed** (browser window visible)      | `npm run test:headed`                            |
| One file                                       | `npx playwright test tests/ui/login.spec.ts`     |
| One test, by ID or title                       | `npx playwright test -g "LOGIN-01"`              |
| Smoke set / regression set                     | `npm run test:smoke` / `npm run test:regression` |
| Chromium + Firefox + WebKit                    | `npm run test:all-browsers`                      |
| API suite                                      | `npm run test:api`                               |
| Visual suite (Linux / Docker / CI only)        | `npm run test:visual`                            |
| UI mode (timeline, watch, pick locator)        | `npm run test:ui`                                |
| Debug step by step (Inspector)                 | `npm run test:debug`                             |
| Type check + lint + format check               | `npm run check`                                  |

### 🔀 Run in random order / replay a failing seed

Tests must not depend on each other, so the suite is also run in a random order (Playwright 1.64 `--shuffle`):

```bash
npm run test:shuffle            # one worker, no retries; prints "shuffle seed 664214884"
npx playwright test --shuffle 664214884 --retries=0 --workers=1   # replays that exact order
npm run test:shuffle:parallel   # random order across all workers
```

Retries are off for these runs on purpose: a retry could hide an order problem (fail, then pass on retry). One worker exposes order problems most reliably. The seeds that passed are listed in [TEST_PLAN.md](TEST_PLAN.md#-4-test-independence--order-randomization).

---

## 📊 Reports

**HTML report (built in).** Generated after every run in `playwright-report/`:

```bash
npm run report
```

A failed test includes its screenshot, video and (on retry) the trace. Open a trace from the report, or with `npx playwright show-trace <trace.zip>`, to step back and forth through every action with the DOM, network and console of that moment.

**Allure report.** Raw results are written to `allure-results/` on every run.

- _Install:_ nothing extra. Allure 3 is a dev dependency (`npm install` installed it) and needs no Java.
- _Generate:_ `npm run allure:generate` (writes `allure-report/`).
- _Open:_ `npm run allure:open`.

**Online.** CI publishes both reports for the latest `master` run: [HTML](https://heziporf.github.io/saucedemo-playwright-ts/) · [Allure](https://heziporf.github.io/saucedemo-playwright-ts/allure/). Every CI run also keeps them as downloadable artifacts for 30 days.

---

## 📁 Project structure

```
.github/workflows/
  playwright.yml            CI: checks, reviewer path (3 OS x 2 Node), browsers, headed, shuffle, API, visual, Pages
  update-snapshots.yml      Manual: regenerates visual baselines in Docker
src/                        Everything the tests use (imported as "@/…")
  page-objects/
    pages/                  One class per page (*.page.ts): locators, actions, then assert… checks;
                            BasePage holds the shared parts
    components/             Parts repeated on several pages: HeaderComponent, SideMenuComponent, ProductCardComponent
  api-clients/              DummyJsonClient: requests and their response checks
  fixtures/                 Playwright fixtures that hand page objects to tests (loggedInPage, loginAs,
                            startCheckoutWith, dummyJsonClient); index.ts merges them into one `test` and `expect`
  matchers/                 Custom expect matchers: toBeSorted (lists), toShowPrice (web-first, on a locator); index.ts merges them
  helpers/                  @step (named report steps), price math (parsePrice, roundToCents, sumPrices), escapeRegExp
  test-data/                Users, the product catalog (expected values), checkout and API inputs
    cases/                  Data-driven case tables: one row = one test
  types/                    TypeScript interfaces and types (User, Product, CustomerDetails, API bodies)
  config/                   env (validated .env), paths, routes (page addresses), tags, timeouts, global setup
tests/                      Spec files only
  setup/                    auth.setup.ts: logs in once and saves the session for loggedInPage
  ui/                       The 5 required areas + known-issues
  network/                  Network-level checks of the saucedemo UI
  api/                      DummyJSON API suite
  visual/                   Screenshot and ARIA snapshot tests (+ baselines)
playwright.config.ts        Projects, reporters, retries, screenshots, video, trace, timeouts
```

## 🛠️ Technologies

Playwright Test 1.64.1 · TypeScript 6.0 (strict) · Node.js ≥ 22.18 · ESLint 10 with type-aware rules (typescript-eslint, eslint-plugin-playwright) · Prettier · dotenv · Allure 3 (allure-playwright) · GitHub Actions · GitHub Pages.

---

## ✅ Assignment requirements: where each one is

| Requirement                                                 | Where                                                                                        |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Page Object Model, a class per page with locators + methods | `src/page-objects/pages/*.page.ts`, `src/page-objects/components/`                           |
| TypeScript with full type safety                            | `tsconfig.json` (strict + extra checks), `src/types/`, `npm run check` in CI                 |
| `.env` + `.env.example` for login data and URL              | `.env.example`, `src/config/env.ts`                                                          |
| Custom fixtures injecting page objects                      | `src/fixtures/` (`loginPage`, `inventoryPage`, … `loggedInPage`)                             |
| Built-in + soft assertions                                  | Web-first `expect` everywhere; `expect.soft` in PRODUCTS-01, CART-02, CHECKOUT-05, API tests |
| Parallel execution, no test dependencies                    | `fullyParallel: true`; proven with `--shuffle` (seeds in TEST_PLAN)                          |
| HTML reporter (+ optional Allure)                           | `playwright.config.ts` reporters; Allure 3                                                   |
| Screenshot + video on failure                               | `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'` (+ `trace: 'on-first-retry'`)  |
| `retries: 1`                                                | `playwright.config.ts`                                                                       |
| README + TEST_PLAN                                          | This file, [TEST_PLAN.md](TEST_PLAN.md)                                                      |
| Bonus: GitHub Actions                                       | `.github/workflows/`                                                                         |
| Bonus: Allure (with install instructions)                   | [Reports](#-reports)                                                                         |
| Bonus: visual regression                                    | `tests/visual/`                                                                              |
| Bonus: API testing                                          | `tests/api/`, `src/api-clients/`, plus `tests/network/`                                      |
| Bonus: custom matchers                                      | `src/matchers/`: `toBeSorted` (lists) and `toShowPrice` (web-first, retries on a locator)    |
| Bonus: tags / annotations                                   | `@smoke`, `@regression`, `@known-bug`, `@api`, `@visual`; `issue` annotations on known bugs  |

## 🔧 Our adjustments, and why

- **API tests run against DummyJSON.** saucedemo has no API, so the API suite uses a public demo shop API. The saucedemo UI also gets network-level tests (`tests/network/`).
- **Visual tests run only on Linux in Docker.** Screenshots differ between operating systems, so baselines are created and compared only inside the official Playwright image. `npm test` never runs them.
- **Known bugs are tests marked `test.fail`.** They check the correct behavior, so the run stays green while the bug exists and turns red the day it is fixed.
- **Playwright 1.64.1, not the newest 1.65.** 1.64.1 has been in use for a month and has every feature used here (`--shuffle`, opt-in projects, typed API responses); 1.65 was only days old when this project started (1.65.1: 13 Nov 2026).
- **Six users, not four.** The four users from the assignment cover the required areas; `error_user` and `visual_user`, found on the site, are used only in the known-issue and visual tests.

## 🧭 Design decisions

- **Locators:** `getByTestId` (with `testIdAttribute: 'data-test'`, saucedemo's attribute) and `getByRole`; no CSS classes or XPath. A product is found by its exact name, never by position, except in sort checks.
- **One class per page, tests only call it:** each `*.page.ts` is ordered locators → actions (with their technical waits) → `assert…` checks (`assertCartContains`, `assertOrderSummaryAddsUp`, …) → private helpers; locators stay private, so a test can only use what the page offers. `DummyJsonClient` does the same for the API. Each test reads as Arrange / Act / Assert, and a lint rule blocks importing `expect` in `tests/`, so checks cannot drift back into the specs.
- **AAA in every test:** Arrange, Act and Assert are separated by a blank line.
- **Assertions:** web-first `expect` on locators (waits and retries, no `waitForTimeout`); `expect.soft` where one screen holds several values; custom messages on the important checks.
- **Tags as constants:** `tags.smoke`, `tags.regression`, … (`src/config/tags.ts`), so a tag cannot be mistyped; ESLint's literal-only tag rule is off for that reason.
- **Independent expected values:** the catalog in `src/test-data/products.data.ts` (copied unchanged from the live site on 2026-11-14) is what the screen is compared against. A test never derives its expected value from the screen it is checking.
- **Waits live in actions:** an action whose destination is known waits for it (e.g. `openCart` waits for `/cart.html`).
- **Login once:** `auth.setup.ts` logs in through the UI and saves the session; `loggedInPage` reuses it. The login tests themselves always use the UI.
- **State through the UI:** carts are filled by clicking, because the site is instant. On a slow app this setup would go through an API or storage instead.
- **Page errors fail tests:** any uncaught JavaScript error fails the test (`failOnPageError`, off only for the known-issue users).
- **Readable reports:** the `@step` decorator turns each page-object action into one named report step (e.g. "LoginPage.login"); its `box` option makes a failure point at the line in the test, not inside the page object.
- **Tax rule:** saucedemo charges 8% of the item total (`TAX_RATE`); CHECKOUT-05 checks it as a known site rule, alongside total = item total + tax.
- **Sorting with equal prices:** two products cost $15.99, so the `toBeSorted` matcher accepts equal neighbours.
- **Documented, not commented:** every class, fixture and matcher has a one-line description (shown on hover in the editor); inside methods, names explain the code, and the reasons behind non-obvious choices are documented here.

## 🐞 Known bugs found

saucedemo ships with users that are **broken on purpose** (`problem_user`, `error_user`, `visual_user`). Testing them found seven bugs (one of them also hits `standard_user`).

**How a known-issue test works:** it checks the **correct** behavior (e.g. "sorting Z→A sorts the list") and is marked `test.fail()`, which tells Playwright _"this test is expected to fail because of a known bug"_:

| The bug is… | The check… | The report shows                              |
| ----------- | ---------- | --------------------------------------------- |
| still there | fails      | ✅ passed (expected failure), with the bug ID |
| fixed       | passes     | ❌ failed: time to remove `test.fail()`       |

So the run stays green while the bugs exist, each bug stays documented and traceable (`issue` annotation, `@known-bug` tag), and a fix is noticed the same day. Run only them with `npx playwright test --grep @known-bug`. Details and reproduction steps: [TEST_PLAN.md](TEST_PLAN.md#-5-found-bugs).

| ID     | User              | Bug                                                                    | Test   |
| ------ | ----------------- | ---------------------------------------------------------------------- | ------ |
| BUG-01 | problem_user      | Every product shows the same broken image                              | KI-01  |
| BUG-02 | problem_user      | Sorting does nothing                                                   | KI-02  |
| BUG-03 | problem_user      | Typing a last name overwrites the first name; checkout cannot continue | KI-03  |
| BUG-04 | error_user        | Sorting shows "Sorting is broken!" and does not sort                   | KI-04  |
| BUG-05 | error_user        | Finish throws an error; the order is never placed                      | KI-05  |
| BUG-06 | **standard_user** | Checkout accepts names and postal code made only of spaces             | KI-06  |
| BUG-07 | visual_user       | Broken image, misplaced buttons, random prices                         | VIS-05 |

## 🔭 What I'd add next

- Accessibility checks with axe-core on each page.
- The site's newer pages (Dynamic Catalog: lazy-load, slider, spinner) and the order PDF download.
- Sharded CI runs with a merged report once the suite grows.
- Edge cases left out by the 6-per-area limit (see TEST_PLAN, Out of scope).
