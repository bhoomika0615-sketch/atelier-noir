# ATELIER NOIR commerce and storefront audit

**Initial audit date:** 2026-10-31
**Current source audit:** 2026-11-10
**Scope:** Existing App Router storefront, local HTTPS journey evidence, cart/checkout interfaces, API and database architecture, payment workflow, responsive/accessibility/SEO surfaces, tests, and a 30-retailer reference sample.
**Worktree note:** This repository already contained uncommitted changes when the audit began. They were preserved. The current tree includes cart-item PATCH/DELETE API and UI changes and checkout form improvements; those flows were not exercised end-to-end in this audit.

## Executive summary

### Current audit update — 2026-11-10

The current application is an existing Next.js App Router storefront using TypeScript, React, Prisma, PostgreSQL in the production schema, and SQLite for local development. Authentication uses opaque database-backed sessions and role checks. Product, cart, checkout, admin-product and Razorpay webhook APIs are present. Existing architecture and working behavior are to be preserved.

Current verification performed without changing application code or database contents:

| Check | Current result |
|---|---|
| `npm run typecheck` | Pass |
| `npm test` | Pass: 2 files, 8 tests (validation and same-origin tests) |
| `npm run build` | Pass; production build generated all 22 listed app/API routes |
| Read-only local SQLite catalogue counts | 0 products, 0 published products, 0 variants with positive stock |
| `npm run security:audit` | Findings: 6 advisories (1 moderate, 5 high); command exits nonzero. Reported dependency paths include Prisma configuration/deepmerge-ts, Next.js/PostCSS, and Zod. Do not force major upgrades without compatibility review. |
| Browser/device verification during this audit | Not run. The older 2026-10-31 report records a 390px overflow check and an inconclusive mobile-menu click; it does not verify the current changed tree or the required viewport set. |

#### Current architecture and routes

- **Rendering and styling:** Next.js 15 App Router, React 19, TypeScript, global CSS, Tailwind dependencies, and Motion for React reveal effects.
- **Persistence:** Prisma 6 with PostgreSQL schema at `prisma/schema.prisma`, SQLite local schema at `prisma/schema.sqlite.prisma`, and a local development database. No destructive data/schema operation was performed.
- **Public pages:** `/`, `/shop`, `/product/[slug]`, `/journal`, `/off-the-rail` (redirect).
- **Customer pages:** `/login`, `/register`, `/cart`, `/account`.
- **Admin page:** `/admin/login`, `/admin` (server-side role verification).
- **API routes:** `/api/products`; `/api/auth/{register,login,admin-login,logout}`; `/api/cart`, `/api/cart/items`; `/api/checkout`; `/api/payments/webhook`; `/api/admin/products`.
- **Existing behavior:** Product rails and collection filters, product detail/size selection, account registration/login, admin login/dashboard metrics, customer order history, authenticated cart read/write, checkout initiation, and signed/idempotent webhook event handling are present in source. The empty local catalogue blocks live product/cart/checkout journeys.

#### Requirement-level findings

| Area | Current status | Evidence and remaining gap |
|---|---|---|
| Core storefront and routes | IMPLEMENTED BUT NOT VERIFIED | Source routes and production build are present; historical route smoke tests passed for public routes. Current browser navigation and all links were not re-tested. |
| Header/footer and navigation | PARTIALLY IMPLEMENTED | Wordmark links home; desktop and `<details>` mobile navigation exist; header is sticky. No search, contact destinations, or several planned support/legal links. The older mobile-menu click test was inconclusive. |
| Commerce and cart | PARTIALLY IMPLEMENTED | Current tree has cart quantity/remove UI and POST/PATCH/DELETE handlers. The 8 tests do not exercise API/database behavior, and no seeded cart was used. Payment and inventory correctness issues A-01–A-06 remain. |
| Admin | PARTIALLY IMPLEMENTED | Login, role checks, metrics, and an admin product API exist. Dashboard is metrics-only; product API cannot create variants/inventory or a sale price, leaving newly created products unavailable for purchase through this interface. |
| Responsive design | IMPLEMENTED BUT NOT VERIFIED | CSS has responsive rules at 1000px, 820px, 480px and 380px. Only historical 390px overflow evidence exists; 320, 375, 430, 768, 1024 and 1440 widths and every route still need checking. |
| Accessibility | PARTIALLY IMPLEMENTED | Focus-visible styles, semantic landmarks/labels in several forms, mobile `<details>` navigation, and reduced-motion CSS/hook support exist. No WCAG audit, contrast measurement, keyboard/screen-reader pass, or full modal/focus-management coverage was performed. No skip link or password visibility control was found. |
| Content and support | PARTIALLY IMPLEMENTED / BLOCKED | Editorial and journal copy exist. No verified address, phone, email, social destinations, contact/help, privacy, terms, shipping, or returns content/routes were found. Do not fabricate these details. The seed contains sample catalog data and external image URLs, but the live local database is empty. |
| SEO | NOT IMPLEMENTED beyond basic root metadata | Only root title/description and global index/follow robots metadata were found. No per-page metadata, canonical, Open Graph/Twitter tags, sitemap, robots file, custom not-found page, favicon set, or structured data was found. Private-route indexing behavior needs explicit treatment. |
| Cookie consent and analytics | NOT IMPLEMENTED | No consent UI, analytics provider/configuration, event integration, or UTM persistence was found. Provider, IDs, and consent requirements are not supplied. |
| Forms and feedback | PARTIALLY IMPLEMENTED | Login/register/admin and checkout forms have basic error or success feedback. Checkout now uses native form submission and required fields. Password toggle, generalized loading/skeleton states, destructive confirmation flows, and success/validation testing are absent or unverified. |
| Performance | IMPLEMENTED BUT NOT VERIFIED / NEEDS IMPROVEMENT | Campaign image is local WebP; product lists use lazy-loaded plain `<img>` tags; CSS/Motion animations and reduced-motion handling exist. Google Fonts load via CSS import, product-detail images are not lazy, and no Lighthouse/Core Web Vitals/bundle optimization run was performed. |
| Security | PARTIALLY IMPLEMENTED; MATERIAL PAYMENT RISKS REMAIN | Source includes bcrypt, opaque hashed sessions, role checks, Zod schemas, same-origin checks, rate limiting, security headers, and signed webhook verification. See A-01–A-03 and A-05–A-06; no penetration test was run. Production secrets/services are not configured here. |
| Testing/deployment | PARTIALLY VERIFIED | Current typecheck, unit suite, and production build pass. No end-to-end commerce, browser, accessibility, link, responsive, or production hosting/deployment verification exists. Dependency audit reports advisories. |

#### Missing and broken behavior to address

- Payment failure currently increments physical stock as well as releasing a reservation; provider-request/payment-record failures can strand reservations. Late/out-of-order webhook events are not state-guarded, and a captured payment clears the customer's whole cart rather than only checked-out items.
- Checkout charges only the item subtotal although the cart says shipping and taxes are calculated later. No policy/calculation is implemented. Repeated checkout attempts can create more reservations because busy state ends once the Razorpay modal opens.
- Checkout reservation release/expiry/reconciliation, provider-failure compensation, payment retries, cancellation/refund, shipping/tax, and cart-clearing rules need business decisions and payment-specific tests before fixes or real payments.
- Admin product creation has no variants/inventory/compare-at-price workflow; the dashboard offers only metrics and a note about the API.
- No custom 404/thank-you route, loading/error boundary, privacy/terms/cookie/help/contact pages, search, cookie consent, analytics, UTM handling, print stylesheet, dark mode, or several other requested global utilities was found.
- No observed or reported destructive database operations occurred. Payment/inventory changes are high regression risk; dependency major upgrades are also high risk.

#### Reusable implementation surfaces and recommended approach

Reuse `SiteHeader`, `SiteFooter`, `AuthForm`, `CartItems`, `CheckoutForm`, `ProductRail`, `Reveal`, `MotionLink`, `SartorialStage`, existing Zod schemas, auth/role guards, rate limiting and global CSS. Do not duplicate these components or replace the Next.js/Prisma/auth architecture.

Proceed in small gated batches: first resolve payment/order business rules and correctness, then admin catalog capability and verified business/legal content; next implement the prioritized shared UX/accessibility/responsive work; then SEO and consent-aware analytics; finish with performance and full route/device/regression verification. Defer business-specific copy, live analytics/payment configuration, and any payment/inventory code until owners provide the missing decisions and test credentials.

### Previous verification snapshot — 2026-10-31

The prior audit established that the homepage displayed truthful empty rails, the shop had an empty-state branch, and the local SQLite catalogue had no products. No sample products were inserted. The historical route and interaction observations below remain useful as dated evidence but are not a current full browser regression.

The storefront builds and serves over HTTPS. The homepage displayed truthful empty rails, and the shop route has an empty-state branch; the shop's rendered state was not manually inspected. The development SQLite catalogue currently contains **0 products, 0 published products, and 0 variants with positive stock**. No sample products were inserted.

The local HTTPS origin mismatch is corrected for development: the dual-origin launcher configures `APP_URLS` for the HTTP and HTTPS development origins, and origin unit tests accept those configured origins while rejecting an external origin. This verifies origin handling only; it does not verify successful authentication or cart/checkout writes.

There are also material payment and inventory risks in the existing code. They are documented below and intentionally **not changed** because modifying order/payment behavior requires explicit approval and payment-specific tests.

## Prioritized findings

| ID | Priority | Finding | Evidence / impact |
|---|---|---|---|
| A-01 | Critical | A failed payment increases physical stock. | Checkout increments only `reserved` in [`checkout/route.ts`](./src/app/api/checkout/route.ts#L24). The failure webhook also increments `stock` in [`webhook/route.ts`](./src/app/api/payments/webhook/route.ts#L31), inflating inventory. The deployment note that failure releases a reservation does not match the implementation ([`SECURITY_REVIEW.md`](./docs/SECURITY_REVIEW.md#L31)). |
| A-02 | High | Payment callbacks can apply incompatible order transitions, and capture clears the user's entire cart. | The webhook unconditionally marks an order paid or cancelled and adjusts stock; capture deletes every item in the user's cart ([`webhook/route.ts`](./src/app/api/payments/webhook/route.ts#L22)). Delayed or distinct events can undo the expected state; products added after checkout can be deleted from the cart. Event-ID deduplication alone does not guard the order transition. |
| A-03 | High | A failed/slow Razorpay order request can leave a pending order and reserved stock. | The reservation/order transaction commits before the provider request. A non-success response throws, and there is no compensating release in that path ([`checkout/route.ts`](./src/app/api/checkout/route.ts#L24)). Payment-row creation occurs later and can fail after the reservation too. No reservation expiry/reconciliation job was found. |
| A-04 | Resolved locally | Same-origin protection rejected local HTTPS writes. | The dual-origin development launcher configures `APP_URLS` for `http://localhost:3000` and `https://localhost:3443`. Tests confirm both are accepted and an external origin is rejected. Production retains the single `APP_URL` fallback, which must match the deployed canonical origin. |
| A-05 | High / business decision | Checkout total is only the item subtotal, while the cart says shipping and tax will be calculated. | Checkout assigns `totalPaise` and the Razorpay amount directly from the item subtotal ([`checkout/route.ts`](./src/app/api/checkout/route.ts#L20)). No shipping/tax calculation was found. Confirm the intended policy before enabling real payments; this audit does not assume fees or tax rules. |
| A-06 | High | Payment modal state does not remain busy after it opens. | `finally` clears `busy` immediately after `razorpay.open()` ([`checkout-form.tsx`](./src/components/checkout-form.tsx#L11)). The form does not track an open/pending payment session, so repeated checkout attempts after dismissal can create additional orders/reservations. |
| A-07 | Partially resolved in current tree; runtime unverified | Shoppers can now change quantity or remove cart items in the current worktree. | [`cart-items.tsx`](./src/components/cart-items.tsx) calls PATCH/DELETE handlers in [`cart/items/route.ts`](./src/app/api/cart/items/route.ts), scoped to the signed-in user's cart. Typecheck/build pass, but no cart API integration test or populated-cart browser test exists. |
| A-08 | Resolved in the product UI; runtime behavior unverified | Product-page size availability could disagree with cart availability. | Product detail now passes only variants where `stock - reserved > 0` to the size selector ([`product/[slug]/page.tsx`](./src/app/product/[slug]/page.tsx)). The empty local catalogue prevented verifying this against an actual product. |
| A-09 | Partially resolved | Add-to-bag failures lacked network-error feedback, and repeat adds replace rather than increase quantity. | The client now reports network/response errors and prevents duplicate submissions while a request is pending ([`add-to-cart.tsx`](./src/components/add-to-cart.tsx)). The POST handler still sets the submitted quantity rather than incrementing an existing line ([`cart/items/route.ts`](./src/app/api/cart/items/route.ts)). |
| A-10 | Medium | Product administration cannot create an available or sale item through the documented API. | The admin page is metrics-only. Product creation validates product details and images but has no variants/inventory input or `compareAtPaise` field ([`validation.ts`](./src/lib/validation.ts#L17), [`admin/products/route.ts`](./src/app/api/admin/products/route.ts#L10)). New products therefore have no purchasable sizes through this interface. |
| A-11 | Medium | Important store-support destinations are absent. | No privacy, terms, shipping, returns, contact, or help routes/links were found. Do not invent business policies; add verified information before launch. |
| A-12 | Medium | Dependency audit reports advisories. | On 2026-11-10, `npm run security:audit` reported 6 production dependency advisories (1 moderate, 5 high). The suggested forced upgrades are breaking major-version changes; no dependency updates were applied. The prior 2026-10-31 full audit dry run reported additional development-tree advisories and is historical. |
| A-13 | Low / verify | The homepage claims “Est. MMXXIV.” | The claim appears in [`page.tsx`](./src/app/page.tsx#L107) but was not substantiated by project documentation. Verify it or remove it. |
| A-14 | Medium | Automated test coverage does not exercise commerce workflows. | Current suite has 8 tests across validation and same-origin handling; it does not cover cart database state, reservation concurrency, webhook transitions/idempotency, or provider failures ([`validation.test.ts`](./tests/validation.test.ts), [`http.test.ts`](./tests/http.test.ts)). |

### Decisions needed before payment fixes

Please explicitly approve changes to payment/order behavior before any fixes are made to A-01 through A-06. A safe implementation needs defined rules for late/out-of-order webhook events, reservation release/expiry, partial or repeated payment attempts, cart clearing, shipping/tax totals, and Razorpay test-mode scenarios. No live payment was initiated during this audit.

## Storefront and journey notes

- The homepage, shop, New, Sale, cart, login, registration, and journal URLs returned HTTP 200 over HTTPS. The legacy `/off-the-rail` URL returned a 307 redirect to the integrated homepage rack.
- The product API returned an empty catalogue. The homepage displayed empty rails; the shop source contains an empty-state branch. No fabricated product data was used.
- Header/category/collection links point to existing routes; no broken internal destination was observed in the route smoke test.
- Search, wishlist, and sorting controls are not implemented. The shop provides category and New/Sale collection links, with newest-first ordering.
- The current checkout form uses a native form submit with required fields, so browser constraint validation is wired in source. It has not been browser-tested on the current tree; server-side schema validation also exists.
- Product detail source now displays the original comparison price for sale items, but a real sale product could not be used to verify this because the catalogue is empty.

## Reference review: 30 retailer destinations

Public pages were checked on 2026-10-31. This was a **reference/access review**, not 30 completed checkout journeys: bot controls, timeouts, regional redirects, and invalid regional paths prevented deep interaction on many sites. Observations below distinguish what was actually visible from access failures.

| Retailer | Page checked | Result / observed reference |
|---|---|---|
| [MR PORTER](https://www.mrporter.com/en-us/) | US home | Page title loaded in browser; snapshot unavailable and direct fetch blocked. No checkout claims. |
| [SSENSE](https://www.ssense.com/en-us/men) | US men's | Page title loaded, but Cloudflare/403 prevented catalogue inspection. |
| [FARFETCH](https://www.farfetch.com/shopping/men/items.aspx) | Men's listing | Geolocated to India and rendered a men's fashion page; embedded third-party frames generated browser errors. |
| [NET-A-PORTER](https://www.net-a-porter.com/en-us/) | US home | Browser page opened, but usable catalogue snapshot was not available; direct fetch blocked. |
| [Mytheresa](https://www.mytheresa.com/us/en/men) | US men's | Anti-automation response; no usable catalogue content. |
| [MATCHES](https://www.matchesfashion.com/) | Home | Request rate-limited (429); no page review. |
| [END.](https://www.endclothing.com/us/men.html) | US men's path | Tested path returned 404; this does not establish that the overall site is unavailable. |
| [Zara](https://www.zara.com/us/en/man-l711.html) | US men's | Fetch blocked (403); browser navigation aborted. |
| [H&M](https://www2.hm.com/en_us/men.html) | US men's | Fetch blocked (403). |
| [COS](https://www.cos.com/en-us/men.html) | US men's path | Tested path returned 404; no conclusion about other regional routes. |
| [Massimo Dutti](https://www.massimodutti.com/us/men-n1390) | US men's | Fetch blocked (403). |
| [Mango](https://shop.mango.com/us/en/c/men) | US men's | Fetch blocked (403). |
| [ASOS](https://www.asos.com/men/) | Men's | Request timed out. |
| [Reiss](https://www.reiss.com/us/en/shop/gender-men) | US men's | Fetch blocked (403). |
| [Ralph Lauren](https://www.ralphlauren.com/men) | Men's | Redirected to India region; direct fetch blocked. |
| [Burberry](https://us.burberry.com/mens-clothing/) | US men's clothing | Listing rendered with 807 items, category links, product imagery, prices, and colour choices. Useful benchmark for category hierarchy and product-card clarity. |
| [Gucci](https://www.gucci.com/us/en/ca/men-c-men) | US men's | Request timed out. |
| [Prada](https://www.prada.com/us/en/mens.html) | US men's | Public page exposed shopping-bag/wishlist empty states and clear contact, FAQ, shipping, returns, privacy, and terms destinations. |
| [Louis Vuitton](https://us.louisvuitton.com/eng-us/men) | US men's | Fetch blocked (403). |
| [Dior](https://www.dior.com/en_us/fashion/mens-fashion) | US men's | Fetch blocked (403). |
| [Saint Laurent](https://www.ysl.com/en-us) | US home | Fetch blocked (403). |
| [Bottega Veneta](https://www.bottegaveneta.com/en-us/men) | US men's | Fetch blocked (403). |
| [Acne Studios](https://www.acnestudios.com/us/en/man/) | US men's | Redirected to 100-item New Arrivals listing; visible cards showed product name, colour, and price. |
| [Fear of God](https://www.fearofgod.com/collections/all) | All products | Page returned a subscription/error state; catalogue not reviewed. |
| [Jacquemus](https://www.jacquemus.com/en_us/men) | US men's path | Fetch blocked (403). |
| [Aimé Leon Dore](https://www.aimeleondore.com/collections/all) | All collection | Accessibility statement loaded; product listing was not available in the returned content. |
| [Represent](https://representclo.com/collections/menswear) | Men's collection | Redirected to all products; membership overlay dominated the returned page. |
| [J.Crew](https://www.jcrew.com/plp/mens) | Men's listing | Redirected to an India-region page and signup content; catalogue not reviewed. |
| [Everlane](https://www.everlane.com/collections/mens) | Men's collection path | Tested path returned 404; no conclusion about other routes. |
| [ARKET](https://www.arket.com/en_usd/men) | Men's | Redirected to global English page; visible New Arrivals/category navigation, wishlist, and delivery/returns links. A cookie consent layer was present. |

### Patterns worth adapting (not copying)

The accessible references reinforce a practical approach for Atelier Noir: direct New/collection navigation; visible item counts and truthful availability; consistent product name, colour, image, and price presentation; and easily found account, bag, delivery, returns, and legal help. Keep the existing real-product data and empty states. Add no policy language, discounts, or inventory that the store owner has not verified.

## Changes deliberately not made

- No database/schema/migration, environment, authentication, payment webhook, checkout API, inventory, order, or product-record changes were made as part of this audit. Pre-existing uncommitted cart API/UI changes were preserved.
- No demo products, test payments, live payment requests, or credential inspection.
- No dependency upgrades: available automated remediation proposes breaking major-version changes that need a separate compatibility plan.
