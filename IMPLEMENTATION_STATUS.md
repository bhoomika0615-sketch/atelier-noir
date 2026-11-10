# Atelier Noir audit and implementation status

**Audit date:** 2026-11-10
**Phase:** 1 audit complete; implementation has not started.
**Worktree:** Pre-existing uncommitted changes were preserved. Cart PATCH/DELETE UI/API and checkout form changes exist in the current tree but have not been integration-tested.
**Status meanings:** COMPLETE AND VERIFIED; IMPLEMENTED BUT NOT VERIFIED; PARTIALLY IMPLEMENTED; NOT IMPLEMENTED; BROKEN; BLOCKED; NOT APPLICABLE.

## Project architecture and existing capabilities

| Requirement / feature | Current status | Files / surfaces | Verification method | Remaining issues |
|---|---|---|---|---|
| Preserve existing framework, database and auth architecture | IMPLEMENTED BUT NOT VERIFIED | `package.json`, `src/app`, `src/lib`, `prisma/` | Source review and production build | Preserve Next.js App Router, Prisma/PostgreSQL production schema, SQLite local schema, opaque session model and RBAC during future implementation |
| Public storefront, shop and product details | IMPLEMENTED BUT NOT VERIFIED | `src/app/page.tsx`, `src/app/shop/page.tsx`, `src/app/product/[slug]/page.tsx` | Build and historical route smoke test | Current browser regression not run; local catalog is empty |
| Journal and legacy rack route | IMPLEMENTED BUT NOT VERIFIED | `src/app/journal/page.tsx`, `src/app/off-the-rail/page.tsx` | Build; historical route check | Journal is a single editorial placeholder-like feature, not a publishing system |
| Customer login, registration and account/order history | IMPLEMENTED BUT NOT VERIFIED | `src/app/login/page.tsx`, `src/app/register/page.tsx`, `src/app/account/page.tsx`, `src/components/auth-form.tsx`, `src/lib/auth.ts` | Typecheck/build and source review | No successful credential journey or order history test performed |
| Admin login and role-protected dashboard | IMPLEMENTED BUT NOT VERIFIED | `src/app/admin/`, `src/lib/auth.ts`, `middleware.ts` | Typecheck/build and source review | Dashboard is metrics-only; no authenticated admin browser/API test |
| Product API and admin product creation | PARTIALLY IMPLEMENTED | `src/app/api/products/route.ts`, `src/app/api/admin/products/route.ts`, `src/lib/validation.ts` | Source review | Admin create schema omits variants, inventory and compare-at price; no workflow to make newly created products purchasable through the UI |
| Cart read, add, quantity change and removal | IMPLEMENTED BUT NOT VERIFIED | `src/app/api/cart/route.ts`, `src/app/api/cart/items/route.ts`, `src/components/cart-items.tsx`, `src/app/cart/page.tsx`, `src/components/add-to-cart.tsx` | Typecheck/build; source review | No cart API/database integration test or populated-cart browser run; add-to-bag POST sets submitted quantity rather than incrementing existing quantity |
| Checkout initiation and Razorpay webhook | BROKEN | `src/app/api/checkout/route.ts`, `src/app/api/payments/webhook/route.ts`, `src/components/checkout-form.tsx` | Source review only | Critical reservation accounting and high-risk state/rollback issues A-01–A-06; no test-mode payment journey |
| Empty-state behavior | IMPLEMENTED BUT NOT VERIFIED | Homepage, shop, product rails, cart | Source review; local read-only database counts | Catalog is empty, so populated product paths remain unverified |

## Global UX and interaction requirements

| Requirement | Current status | Files / surfaces | Verification method | Remaining issues |
|---|---|---|---|---|
| Dark mode and persistent preference | NOT IMPLEMENTED | Global layout/styles | Source search | No toggle, theme state or persistence |
| Cookie consent banner | NOT IMPLEMENTED | Shared layout/footer | Source search | No consent UI or preference storage |
| Site search | NOT IMPLEMENTED | Header/shop/API | Source search | No search UI or search behavior |
| Back-to-top button | NOT IMPLEMENTED | Shared UI | Source search | No control |
| Functional mobile menu | IMPLEMENTED BUT NOT VERIFIED | `src/components/site-header.tsx`, `src/app/globals.css` | Source review; older 390px browser click was inconclusive | Need current-tree touch/keyboard/open/close/outside-navigation checks |
| Loading animations and skeletons | PARTIALLY IMPLEMENTED | `src/components/reveal.tsx`, route components | Source review | Reveal/hero animations exist; no route skeletons/loading boundaries |
| Consistent hover/focus states | PARTIALLY IMPLEMENTED | `src/app/globals.css` | Source review | Hover styling exists for many controls; keyboard and touch consistency not validated |
| Scroll progress bar | NOT IMPLEMENTED | Shared layout | Source search | No progress indicator |
| Copy-to-clipboard controls | NOT APPLICABLE | Current page surfaces | Source review | No current content/action where a copy control is clearly required |
| Print stylesheet | NOT IMPLEMENTED | `src/app/globals.css` | Source search | No print rules |
| Sticky desktop header | IMPLEMENTED BUT NOT VERIFIED | `src/components/site-header.tsx`, `src/app/globals.css` | Source review | CSS uses sticky positioning; browser behavior not checked |
| Sticky mobile header | IMPLEMENTED BUT NOT VERIFIED | `src/components/site-header.tsx`, `src/app/globals.css` | Source review | Shared header remains sticky at mobile breakpoint; viewport behavior not checked |
| Skip-to-content link | NOT IMPLEMENTED | `src/app/layout.tsx` | Source review | No skip link or matching main-content target |
| Password visibility toggle | NOT IMPLEMENTED | `src/components/auth-form.tsx` | Source review | Password field is always masked |
| UTM tracking/parameter preservation | NOT IMPLEMENTED | Routing/analytics | Source search | No UTM capture or campaign attribution behavior |
| Form success/error feedback | PARTIALLY IMPLEMENTED | `src/components/auth-form.tsx`, `src/components/checkout-form.tsx`, cart controls | Source review | Basic feedback exists; authentication, checkout and cart success/error journeys not browser-tested |
| Confirmation for destructive actions | NOT IMPLEMENTED | Cart/admin interactions | Source review | No confirmation workflow; cart removal has no confirmation, admin destructive actions are not present |
| Last-updated dates where relevant | NOT IMPLEMENTED | Journal/content pages | Source review | No article update metadata/content dates |
| Expandable FAQ sections | NOT IMPLEMENTED | Public content pages | Source search | No FAQ content or component |
| Floating contact button | BLOCKED | Shared layout/contact surface | Source review | No verified contact channel/details to link |
| Sticky mobile CTA | NOT IMPLEMENTED | Product pages | Source review | No sticky product/cart call to action |
| Reduced-motion support | IMPLEMENTED BUT NOT VERIFIED | `src/app/globals.css`, `src/components/reveal.tsx`, `src/components/sartorial-stage.tsx` | Source review | CSS and Motion hooks support reduced motion; no assistive/browser preference test |

## Responsive layout

| Requirement / viewport | Current status | Files / surfaces | Verification method | Remaining issues |
|---|---|---|---|---|
| Responsive CSS rules and breakpoints | IMPLEMENTED BUT NOT VERIFIED | `src/app/globals.css` | Source review; breakpoints at 1000, 820, 480 and 380px | Rules exist, but page-by-page current browser testing is outstanding |
| No horizontal overflow on all pages | IMPLEMENTED BUT NOT VERIFIED | All public/customer/admin page layouts | Historical report only: 390px homepage had no overflow | Retest current tree and all page templates |
| 320px viewport | IMPLEMENTED BUT NOT VERIFIED | All pages | No current browser test | Required overflow, wrapping and controls checks |
| 375px viewport | IMPLEMENTED BUT NOT VERIFIED | All pages | No current browser test | Required viewport check |
| 390px viewport | IMPLEMENTED BUT NOT VERIFIED | All pages | Historical homepage overflow check; mobile menu click inconclusive | Recheck current code and all page templates |
| 430px viewport | IMPLEMENTED BUT NOT VERIFIED | All pages | No current browser test | Required viewport check |
| 768px viewport | IMPLEMENTED BUT NOT VERIFIED | All pages | No current browser test | Required tablet/layout check |
| 1024px viewport | IMPLEMENTED BUT NOT VERIFIED | All pages | No current browser test | Required breakpoint transition check |
| 1440px viewport | IMPLEMENTED BUT NOT VERIFIED | All pages | No current browser test | Required wide-screen check |
| Responsive product grids, images, forms, typography and spacing | PARTIALLY IMPLEMENTED | Shop/product/cart/auth pages and global CSS | Source review | Product data paths are empty; verify real content, clipping, touch targets and focus visibility at requested widths |

## Navigation, buttons, forms and content

| Requirement | Current status | Files / surfaces | Verification method | Remaining issues |
|---|---|---|---|---|
| Logo links to home | COMPLETE AND VERIFIED | `src/components/site-header.tsx` | Source review | None found |
| Internal navigation destinations | IMPLEMENTED BUT NOT VERIFIED | Header/footer/page links | Historical route smoke test | Retest all internal links on current tree; no current automated link check |
| External links | IMPLEMENTED BUT NOT VERIFIED | Font, image and payment integrations | Source review | External availability, licensing and CSP/runtime behavior not comprehensively tested |
| Phone/email links | BLOCKED | Footer/contact content | Source review | No verified phone or email is available; none should be invented |
| Cart quantity/remove actions | IMPLEMENTED BUT NOT VERIFIED | Cart component/API | Source review; typecheck/build | Integration/browser tests needed; no current local cart items |
| Checkout address form validation | IMPLEMENTED BUT NOT VERIFIED | `src/components/checkout-form.tsx`, `src/lib/validation.ts` | Source review; build | Native `required` form submit is wired in source, not browser-tested |
| Successful auth/cart/checkout workflows | BLOCKED | Auth/cart/checkout APIs and UI | No successful integration tests | Requires isolated test data; checkout also needs Razorpay test credentials and business rules |
| Fake testimonials/contact details | COMPLETE AND VERIFIED | Public page source | Search/source review | No fake testimonials/contact details found; verify all seed/media copy before production |
| Placeholder or unverified content | PARTIALLY IMPLEMENTED | Homepage, journal, seed catalog, README | Source review | Journal is editorial stub copy; README identifies seeded external catalog image URLs as placeholders; “Est. MMXXIV” needs verification |
| Empty sections and product content | PARTIALLY IMPLEMENTED | Homepage/shop/product pages | Source review and local DB counts | Honest empty states exist; actual catalog imagery/alt/content cannot be validated with zero records |

## SEO and technical SEO

| Requirement | Current status | Files / surfaces | Verification method | Remaining issues |
|---|---|---|---|---|
| Unique title per public page | NOT IMPLEMENTED | `src/app/layout.tsx`, route pages | Source search | Only root title found |
| Unique meta description per public page | NOT IMPLEMENTED | `src/app/layout.tsx`, route pages | Source search | Only root description found |
| Canonical URLs | NOT IMPLEMENTED | Route metadata | Source search | No canonical base URL/configuration |
| Open Graph and Twitter/X metadata | NOT IMPLEMENTED | Route metadata | Source search | No social metadata/image configuration |
| Complete favicon set | NOT IMPLEMENTED | `public/` | File inventory | No favicon assets found |
| Custom 404 page | NOT IMPLEMENTED | `src/app/not-found.tsx` absent | App route inventory/build | Framework default only |
| `robots.txt` | NOT IMPLEMENTED | `src/app/robots.ts` or `public/robots.txt` absent | File inventory/source search | Must avoid exposing private routes |
| XML sitemap | NOT IMPLEMENTED | `src/app/sitemap.ts` absent | File inventory/source search | Must include public URLs only |
| Indexing rules for private routes | NOT IMPLEMENTED | Route metadata/middleware | Source review | Root robots currently says index/follow; private-route noindex policy not defined |
| Semantic HTML/heading structure | PARTIALLY IMPLEMENTED | Page components | Source review | Landmarks and headings exist, but whole-site hierarchy was not manually validated |
| Meaningful/decorative image alt text | PARTIALLY IMPLEMENTED | `ProductImage` data and page components | Source review | Catalog is empty; verify alt text for real product data and decorative image handling |
| Structured data | NOT IMPLEMENTED | Public route metadata | Source search | No relevant schema.org data |
| SEO-friendly URLs | IMPLEMENTED BUT NOT VERIFIED | `/product/[slug]`, shop query filters | Source review | Existing route shape is compatible; canonical/indexing needs implementation |

## Pages, legal, analytics and tracking

| Requirement | Current status | Files / surfaces | Verification method | Remaining issues |
|---|---|---|---|---|
| Privacy Policy | BLOCKED | Public route/footer | Route inventory | No route/content; requires verified practices and review |
| Terms and Conditions | BLOCKED | Public route/footer | Route inventory | No route/content; requires business/legal review |
| Cookie consent | NOT IMPLEMENTED | Shared layout | Source search | Consent banner/preferences absent |
| Thank You page | NOT IMPLEMENTED | Checkout flow | Route inventory/source review | Successful payment redirects to account; no dedicated confirmation route |
| Custom 404 | NOT IMPLEMENTED | App routes | Route inventory | Default framework page only |
| Analytics integration | BLOCKED | App layout/route tracking | Source search | Provider and configuration are not supplied |
| Environment-based analytics configuration | BLOCKED | Environment template and app layout | Source search | Cannot wire safely before selecting a provider |
| UTM and campaign preservation | NOT IMPLEMENTED | Navigation/analytics | Source search | No attribution behavior |
| No analytics before required consent | NOT APPLICABLE until a provider is selected | Analytics integration | Source search | Must be a hard acceptance test if analytics is approved |
| No fabricated analytics IDs/secrets | COMPLETE AND VERIFIED | Source/environment review | Source search | No analytics IDs were found; keep secrets server-only |

## Accessibility

| Requirement | Current status | Files / surfaces | Verification method | Remaining issues |
|---|---|---|---|---|
| Keyboard navigation and visible focus | PARTIALLY IMPLEMENTED | `src/app/globals.css`, interactive components | Source review | Focus-visible styles exist; no complete keyboard-only audit |
| Screen-reader labels and semantic controls | PARTIALLY IMPLEMENTED | Header/forms/cart/components | Source review | Some controls have labels/ARIA; full route coverage unverified |
| Color contrast target (WCAG 2.2 AA) | IMPLEMENTED BUT NOT VERIFIED | `src/app/globals.css` color palette | No contrast tool run | Measure text, focus, disabled and interactive states |
| Accessible forms and validation | PARTIALLY IMPLEMENTED | Auth/checkout forms | Source review | Labels/required attributes exist; error announcements/focus behavior not fully validated |
| Accessible modal behavior and Escape/focus management | BLOCKED | Checkout provider modal | Source review | Razorpay supplies its own modal; test its accessibility in provider test mode |
| Skip link | NOT IMPLEMENTED | Root layout | Source review | Add before main content |
| Reduced-motion preference | IMPLEMENTED BUT NOT VERIFIED | CSS and Motion components | Source review | Verify operating-system/browser preference |
| Accessible mobile navigation | IMPLEMENTED BUT NOT VERIFIED | Header `<details>` menu | Source review | Keyboard and screen-reader testing outstanding |
| WCAG 2.2 AA conformance | IMPLEMENTED BUT NOT VERIFIED | All public and private routes | No audit performed | Requires manual and automated audit; do not claim conformance yet |

## Performance, security and operations

| Requirement | Current status | Files / surfaces | Verification method | Remaining issues |
|---|---|---|---|---|
| Local hero campaign image format | IMPLEMENTED BUT NOT VERIFIED | `public/atelier-noir-campaign.webp` | File inventory/build | Confirm licensing, dimensions, compression and visual quality |
| Product image loading/optimization | PARTIALLY IMPLEMENTED | Shop, rails and product pages | Source review | Plain `<img>` used; list images lazy-load, product detail does not; catalog has external seed URLs |
| Font loading | PARTIALLY IMPLEMENTED | `src/app/globals.css` | Source review | Google Fonts CSS import creates external request; no measured loading/layout shift |
| Unnecessary JavaScript/bundle | IMPLEMENTED BUT NOT VERIFIED | Build output | Build reports shared first-load JS of ~103 kB | No bundle analysis or performance budget comparison |
| Animation/rendering performance | IMPLEMENTED BUT NOT VERIFIED | Reveal, ticker, stage, global CSS | Source review | No device-level performance/CWV run |
| Loading states/layout shifts | PARTIALLY IMPLEMENTED | Components/routes | Source review | Some button loading states; no route skeletons or CLS measurement |
| Session hashing, password hashing and RBAC | IMPLEMENTED BUT NOT VERIFIED | `src/lib/auth.ts`, auth APIs, middleware | Source review | No security tests for session lifecycle or authorization boundaries |
| Request validation and same-origin protection | IMPLEMENTED BUT NOT VERIFIED | `src/lib/validation.ts`, `src/lib/http.ts`, APIs | Unit tests for schemas/origin | Current tests do not exercise API handlers or database ownership |
| Rate limiting | IMPLEMENTED BUT NOT VERIFIED | `src/lib/rate-limit.ts`, auth/cart/checkout APIs | Source review | Production Upstash configuration is not present/verified |
| Response security headers | IMPLEMENTED BUT NOT VERIFIED | `next.config.ts`, `middleware.ts` | Source review | Deployment response headers not tested; CSP includes `unsafe-inline` |
| Payment/inventory correctness | BROKEN | Checkout and webhook APIs | Source review | A-01–A-06; do not accept live payments |
| Production dependency audit | BROKEN | `package.json`, `package-lock.json` | `npm run security:audit` | 6 findings (1 moderate, 5 high); compatibility-reviewed updates required |
| Production deployment, TLS, backups and monitoring | BLOCKED | Hosting/provider configuration | Not available in repository | Hosting, TLS, private DB, backups/restore, rate limit, monitoring and incident response remain deployment tasks |

## Verification run for this audit

| Check | Result |
|---|---|
| `npm run typecheck` | Pass |
| `npm test` | Pass: 2 files, 8 tests |
| `npm run build` | Pass |
| Read-only local SQLite counts | 0 products, 0 published products, 0 in-stock variants |
| `npm run security:audit` | 6 advisories; nonzero exit |
| Browser, responsive, accessibility, link and end-to-end testing | Not run on the current tree |

## Approval gate

Phase 1 is complete. No application implementation has begun. Wait for approval before starting a plan batch. Payment/order fixes, legal/business copy, analytics, and live integrations require the inputs listed in `IMPLEMENTATION_PLAN.md`.
