# Atelier Noir implementation plan

## Guardrails

- Implement only after explicit approval of the Phase 1 audit.
- Preserve the current Next.js App Router, Prisma/PostgreSQL production setup, SQLite local workflow, authentication/session model, role checks, APIs, and visual identity.
- Make small, reviewable changes and retain all current uncommitted work.
- Do not create real product, contact, policy, analytics, or payment facts that have not been supplied.
- Do not enable live payments until order, inventory, shipping/tax, and refund behavior is decided and tested.

## Prioritized batches

| Order | Batch and objective | Prerequisites / dependencies | Complexity | Likely files | Verification |
|---|---|---|---|---|---|
| 0 | Resolve business inputs and approve scope | Owner decisions below; must precede payment, policy, analytics, and contact implementation | Small | No code expected | Record decisions in issue/task; verify required configuration is available without exposing secrets |
| 1 | Correct checkout/payment/order and stock lifecycle | Explicit rules for late/out-of-order webhooks, repeated attempts, expiry, cart clearing, shipping/tax, failure/refund; test-mode Razorpay setup for integration tests | Large / high risk | `src/app/api/checkout/route.ts`, `src/app/api/payments/webhook/route.ts`, `src/components/checkout-form.tsx`, Prisma schemas only if a justified model change is needed, new focused tests | Unit/integration tests for transitions, duplicates, provider failures, reservation expiry, idempotency, and concurrent stock; test-mode checkout; confirm no live provider calls |
| 2 | Finish product administration and catalog lifecycle | Confirm admin workflow, variant sizes/SKUs, stock and compare-at-price rules | Medium | `src/app/admin/page.tsx`, `src/app/api/admin/products/route.ts`, `src/lib/validation.ts`, focused admin tests; schema only if required | Authorized/unauthorized API tests; create/edit/publish product and variants; verify resulting shop/product/cart behavior |
| 3 | Resolve real content and customer-support destinations | Verified contact details, business location, delivery/returns/shipping/tax policies, legal review, licensed final media | Medium / externally blocked | `src/app` new public pages as approved, `src/components/site-footer.tsx`, `src/components/site-header.tsx`, `README.md` if setup docs need correction, `public/` only for approved assets | Route/link checks; content owner review; verify no placeholder claims or unsupported legal guarantees |
| 4 | Improve shared shell and prioritized interactions | Phase 1 approval; do not add optional controls without useful behavior/content | Medium | `src/components/site-header.tsx`, `src/components/site-footer.tsx`, new shared utility components if justified, `src/app/layout.tsx`, `src/app/globals.css` | Keyboard/mobile menu tests; persistence tests for any preference; form/error-state tests; confirm every control has a real action |
| 5 | Complete responsive and accessibility pass | Shared shell changes from batch 4; real representative content where available | Medium | `src/app/globals.css`, shared components, all affected route components | Browser checks at 320, 375, 390, 430, 768, 1024, and 1440px on representative page types; keyboard, reduced-motion, screen-reader/labels, contrast and focus checks; no horizontal overflow |
| 6 | Add route-specific SEO and technical metadata | Final public route list, verified public copy/media, decision on canonical origin | Medium | `src/app/layout.tsx`, page `metadata`/`generateMetadata`, `src/app/not-found.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, approved `public/` icons | Inspect rendered head tags per public route; ensure account/admin/private routes are not indexed; validate sitemap and robots output; verify 404 |
| 7 | Add consent-aware analytics and campaign tracking | Provider, IDs, deployment secret/config plan, legal/consent requirements and approved events | Medium / externally blocked | `src/app/layout.tsx`, consent component, route/navigation tracking helper, environment template/docs, tests | Prove no analytics request fires before required consent; verify UTM capture/preservation and no secrets in client bundles |
| 8 | Optimize media, fonts, and rendering | Final licensed imagery and representative populated catalog; preserve art direction | Medium | `src/app/globals.css`, product/home components, `next.config.ts` only if justified, `public/` approved assets | Build; image/font inspection; Lighthouse/Core Web Vitals on representative routes; confirm layout stability and reduced-motion behavior |
| 9 | Full regression and production-readiness decision | Batches 1–8 complete or explicitly deferred; production-like config/test services | Large | Tests and any directly affected application files | Typecheck, lint if configured, tests, production build, route/API/link checks, full checkout/auth/admin regression, viewport matrix, accessibility/SEO review, dependency audit, security/deployment checklist |

## Recommended sequencing

1. Approval and business-input gate.
2. Payment/order correctness before enabling real checkout. This may run in parallel with catalog administration only after those scopes are individually approved; it must not be rushed to avoid blocking UI work.
3. Admin catalog and verified content/legal destinations.
4. Shared navigation and utility behavior, then responsive/accessibility validation across pages.
5. SEO and consent-controlled analytics after public content and canonical origin are known.
6. Media/performance work and full regression.

## Decisions and information required

- Payment rules: shipping/tax/discount calculation, payment retry semantics, terminal order states, duplicate and late webhook handling, reservation expiry/release, refund/cancellation behavior, and whether successful payment clears only the checked-out cart lines.
- Store data: verified business name/address/location, contact phone/email, social URLs, delivery/returns/shipping policies, privacy/terms copy, and legal review requirements.
- Catalog operations: product editor requirements, allowed sizes, SKU rules, stock management and sale-price policy.
- Analytics: provider, non-secret public ID/configuration, event list, required consent behavior/jurisdictions, and UTM attribution retention policy.
- Assets: approved, licensed campaign and product photography and final product image descriptions.

## Risks and mitigation

| Risk | Mitigation |
|---|---|
| Payment or stock fixes corrupt orders/inventory | Require explicit rules, targeted transaction/webhook tests, test-mode provider verification, and no live payments during development |
| Uncommitted worktree changes are overwritten | Inspect diffs before touching affected files; make surgical edits and report all modified files |
| Fabricated legal/business content | Block those pages/links until verified details and appropriate review are supplied |
| Privacy or consent violations from analytics | Do not install/configure a provider until the owner selects one and consent requirements are understood; test network calls before/after consent |
| Responsive fixes regress editorial layout | Validate representative page templates at the full requested viewport matrix, not just the homepage |
| Major dependency updates introduce breaking changes | Review advisories and compatibility individually; upgrade in a separate branch/batch with tests, not `npm audit fix --force` |
| Empty catalog masks commerce defects | Use isolated test fixtures/test database and test credentials; never seed or mutate the current local/production catalog as an audit shortcut |

## Testing strategy

- Keep current typecheck/unit/build checks; add tests around the exact changed behavior rather than relying on successful compilation.
- Add API/database integration coverage for cart ownership and quantity limits, checkout reservation rollback, webhook ordering/idempotency and stock accounting, admin permissions, and provider failures.
- Use only isolated test data and Razorpay test mode for payment journey validation.
- Use browser automation for mobile menu, forms, cart/product states, accessible keyboard behavior, per-route metadata, and the required viewport matrix.
- Run final link, accessibility, SEO and performance checks only against meaningful populated test fixtures; label any blocked live verification accurately.
