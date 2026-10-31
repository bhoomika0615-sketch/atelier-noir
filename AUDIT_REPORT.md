# ATELIER NOIR commerce and storefront audit

**Audit date:** 2026-10-31  
**Scope:** Public storefront, local HTTPS journey, cart/checkout interfaces, API route inventory, payment workflow review, and a 30-retailer reference sample.  
**Code changes:** No application, database, environment, authentication, payment, or inventory code was changed. This audit only adds the requested reports.

## Executive summary

The storefront builds and serves over HTTPS. The homepage displayed truthful empty rails, and the shop route has an empty-state branch; the shop's rendered state was not manually inspected. The development SQLite catalogue currently contains **0 products, 0 published products, and 0 variants with positive stock**. No sample products were inserted.

The local pages are reachable, but a browser POST to the login API from `https://localhost:3000` returns **403 `Invalid request origin.`** The local HTTPS script does not set `APP_URL`, the README says a local `.env` is unnecessary, and `.env.example` uses `http://localhost:3000`. As a result, account creation/login and authenticated cart/checkout writes cannot be validated locally until the allowed origin is configured correctly.

There are also material payment and inventory risks in the existing code. They are documented below and intentionally **not changed** because modifying order/payment behavior requires explicit approval and payment-specific tests.

## Prioritized findings

| ID | Priority | Finding | Evidence / impact |
|---|---|---|---|
| A-01 | Critical | A failed payment increases physical stock. | Checkout increments only `reserved` in [`checkout/route.ts`](./src/app/api/checkout/route.ts#L24). The failure webhook also increments `stock` in [`webhook/route.ts`](./src/app/api/payments/webhook/route.ts#L31), inflating inventory. The deployment note that failure releases a reservation does not match the implementation ([`SECURITY_REVIEW.md`](./docs/SECURITY_REVIEW.md#L31)). |
| A-02 | High | Payment callbacks can apply incompatible order transitions, and capture clears the user's entire cart. | The webhook unconditionally marks an order paid or cancelled and adjusts stock; capture deletes every item in the user's cart ([`webhook/route.ts`](./src/app/api/payments/webhook/route.ts#L22)). Delayed or distinct events can undo the expected state; products added after checkout can be deleted from the cart. Event-ID deduplication alone does not guard the order transition. |
| A-03 | High | A failed/slow Razorpay order request can leave a pending order and reserved stock. | The reservation/order transaction commits before the provider request. A non-success response throws, and there is no compensating release in that path ([`checkout/route.ts`](./src/app/api/checkout/route.ts#L24)). Payment-row creation occurs later and can fail after the reservation too. No reservation expiry/reconciliation job was found. |
| A-04 | High / local blocker | Same-origin protection rejects local HTTPS writes. | `assertSameOrigin()` rejects requests if `APP_URL` is unset or differs from the request origin ([`http.ts`](./src/lib/http.ts#L11)). The local HTTPS script does not set it; `.env.example` instead documents HTTP ([`.env.example`](./.env.example#L4)). A real, non-mutating test login request to the running HTTPS server returned 403. |
| A-05 | High / business decision | Checkout total is only the item subtotal, while the cart says shipping and tax will be calculated. | Checkout assigns `totalPaise` and the Razorpay amount directly from the item subtotal ([`checkout/route.ts`](./src/app/api/checkout/route.ts#L20)). No shipping/tax calculation was found. Confirm the intended policy before enabling real payments; this audit does not assume fees or tax rules. |
| A-06 | High | Payment modal state does not remain busy after it opens. | `finally` clears `busy` immediately after `razorpay.open()` ([`checkout-form.tsx`](./src/components/checkout-form.tsx#L11)). The form does not track an open/pending payment session, so repeated checkout attempts after dismissal can create additional orders/reservations. |
| A-07 | Medium | Shoppers cannot edit or remove cart items. | The cart page only renders the existing quantity ([`cart/page.tsx`](./src/app/cart/page.tsx#L43)); the API inventory contains cart GET and add/upsert POST only. There is no quantity/remove endpoint or UI. |
| A-08 | Medium | Product-page size availability can disagree with cart availability. | Product detail selects variants with `stock > 0` ([`product/[slug]/page.tsx`](./src/app/product/[slug]/page.tsx#L13)); cart writes correctly check `stock - reserved` ([`cart/items/route.ts`](./src/app/api/cart/items/route.ts#L14)). A fully reserved size can appear selectable and then fail when added. |
| A-09 | Medium | Add-to-bag failures have no explicit network-error feedback, and repeat adds replace rather than increase quantity. | The client handler has no `try/catch` ([`add-to-cart.tsx`](./src/components/add-to-cart.tsx#L6)); the API upsert sets quantity to the submitted value ([`cart/items/route.ts`](./src/app/api/cart/items/route.ts#L16)). |
| A-10 | Medium | Product administration cannot create an available or sale item through the documented API. | The admin page is metrics-only. Product creation validates product details and images but has no variants/inventory input or `compareAtPaise` field ([`validation.ts`](./src/lib/validation.ts#L17), [`admin/products/route.ts`](./src/app/api/admin/products/route.ts#L10)). New products therefore have no purchasable sizes through this interface. |
| A-11 | Medium | Important store-support destinations are absent. | No privacy, terms, shipping, returns, contact, or help routes/links were found. Do not invent business policies; add verified information before launch. |
| A-12 | Medium | Dependency audit reports advisories. | `npm run security:audit` reported 6 issues (1 moderate, 5 high). The full audit dry run reported 9 (2 moderate, 5 high, 2 critical), including `postcss`, `zod`, Prisma configuration, and Vitest dependencies. The suggested forced updates move to major versions (Next 16, Zod 4, Prisma 7, Vitest 5); no dependency updates were applied. |
| A-13 | Low / verify | The homepage claims “Est. MMXXIV.” | The claim appears in [`page.tsx`](./src/app/page.tsx#L107) but was not substantiated by project documentation. Verify it or remove it. |
| A-14 | Medium | Automated test coverage does not exercise commerce workflows. | The suite contains four validation tests; it does not cover cart state, reservation concurrency, webhook transitions/idempotency, or provider failures ([`validation.test.ts`](./tests/validation.test.ts)). |

### Decisions needed before payment fixes

Please explicitly approve changes to payment/order behavior before any fixes are made to A-01 through A-06. A safe implementation needs defined rules for late/out-of-order webhook events, reservation release/expiry, partial or repeated payment attempts, cart clearing, shipping/tax totals, and Razorpay test-mode scenarios. No live payment was initiated during this audit.

## Storefront and journey notes

- The homepage, shop, New, Sale, cart, login, registration, and journal URLs returned HTTP 200 over HTTPS. The legacy `/off-the-rail` URL returned a 307 redirect to the integrated homepage rack.
- The product API returned an empty catalogue. The homepage displayed empty rails; the shop source contains an empty-state branch. No fabricated product data was used.
- Header/category/collection links point to existing routes; no broken internal destination was observed in the route smoke test.
- Search, wishlist, and sorting controls are not implemented. The shop provides category and New/Sale collection links, with newest-first ordering.
- The checkout address fields have `required` attributes, but the checkout button is not a form submit; browser-native required-field validation therefore is not triggered. Server validation still exists.
- Product detail does not present the original comparison price even though sale prices appear in the listing/rails; this could not be verified against a real sale product because the catalogue is empty.

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

- No database/schema/migration, environment, authentication, admin, API, payment, inventory, order, or product-record changes.
- No demo products, test payments, live payment requests, or credential inspection.
- No dependency upgrades: available automated remediation proposes breaking major-version changes that need a separate compatibility plan.
