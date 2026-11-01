# ATELIER NOIR audit test report

**Test date:** 2026-10-31  
**Environment:** Windows, Node.js 22, local Next.js development server at `https://localhost:3000`, local SQLite schema.

## Round 1 — Static checks and unit tests

| Check | Result |
|---|---|
| `npm run typecheck` | Pass (`tsc --noEmit`) |
| `npm test` | Pass: 1 file, 4 tests |
| `npm run build` | Pass after temporarily stopping the dev server. The first attempt hit Windows `EPERM` while Prisma tried replacing a query-engine DLL held by the running dev process. The HTTPS dev server was restarted afterward. |

## Round 2 — HTTPS routes and safe API probes

| Probe | Result |
|---|---|
| `/`, `/shop`, `/shop?collection=new`, `/shop?collection=sale`, `/cart`, `/login`, `/register`, `/journal` | HTTP 200 |
| `/off-the-rail` | HTTP 307 to the integrated homepage rack anchor |
| `GET /api/products` | HTTP 200 with 0 products |
| Read-only local database counts | 0 total products, 0 published products, 0 variants with positive stock |
| Initial `POST /api/auth/login` probe with matching HTTPS Origin | HTTP 403 `Invalid request origin.` This was before the local origin configuration fix; no credentials or account data were used. |

## Round 3 — Responsive and commerce journey

- At 390px viewport width, homepage rendered three empty product rails and zero product cards. `document.documentElement.scrollWidth` equaled the available client width (375px); no horizontal overflow was observed.
- The browser automation timed out when attempting to click the mobile menu control. The control was visible, but its open/close action is **inconclusive**, not a pass.
- Product details, variant selection, cart updates, checkout, and payment callbacks could not be exercised because the local catalogue is empty. The later origin-check probe is documented below.
- No seed script, demo records, external payment request, or live payment was run.

## Follow-up remediation verification

| Check | Result |
|---|---|
| HTTPS dev script syntax | Pass (PowerShell parser) |
| `npm run typecheck` | Pass |
| `npm test` | Pass: 1 file, 4 tests |
| `npm run build` | Pass |
| HTTPS `/` and `/shop` after the origin configuration change | HTTP 200 |
| Empty `POST /api/auth/login` with `Origin: https://localhost:3000` | HTTP 400 request validation, rather than 403 origin rejection. This verifies origin handling only; no successful login was attempted. |
| Product size availability | Source now filters on `stock - reserved > 0`; runtime verification is blocked by the empty catalogue. |
| Add-to-bag client | Source now reports server/network errors and disables repeated submission while pending; product/cart interaction is blocked by the empty catalogue. |
| Shop search and sorting | Browser verified query `q=silk&sort=oldest` updates the form and results. Empty catalog returns a truthful no-match state. |
| Cart API `POST`, `PATCH`, `DELETE` without a session | Each returned HTTP 401 `Authentication required`; no cart data was modified. |
| Mobile shop layout | At 390px viewport, document content width matched the available 375px; no horizontal overflow. Search and sort controls rendered and the query form navigated successfully. |

## Dependency audit

- `npm run security:audit` completed with 6 advisories (1 moderate, 5 high).
- `npm audit fix --dry-run` reported 9 advisories (2 moderate, 5 high, 2 critical). Suggested remediation includes major-version upgrades; no package or lockfile changes were made.

## Final status

The production build passed before this follow-up batch; it was not rerun with the current changes while the dev server was using the Prisma Windows DLL. TypeScript, unit tests, route checks, mobile shop layout, and unauthenticated cart API checks passed. Successful authentication, authenticated cart edits, product-level journeys, and payment remain unverified because the local catalogue has no products and no test account/payment configuration is available. Payment/inventory risks remain documented in [`AUDIT_REPORT.md`](./AUDIT_REPORT.md). No database schema, credentials, or product records were changed.
