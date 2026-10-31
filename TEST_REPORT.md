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
| `POST /api/auth/login` with a test-only invalid account and matching HTTPS Origin | HTTP 403 `Invalid request origin.` No credentials or account data were used. |

## Round 3 — Responsive and commerce journey

- At 390px viewport width, homepage rendered three empty product rails and zero product cards. `document.documentElement.scrollWidth` equaled the available client width (375px); no horizontal overflow was observed.
- The browser automation timed out when attempting to click the mobile menu control. The control was visible, but its open/close action is **inconclusive**, not a pass.
- Product details, variant selection, cart updates, checkout, and payment callbacks could not be exercised because the local catalogue is empty and the HTTPS same-origin guard rejects local POSTs.
- No seed script, demo records, external payment request, or live payment was run.

## Dependency audit

- `npm run security:audit` completed with 6 advisories (1 moderate, 5 high).
- `npm audit fix --dry-run` reported 9 advisories (2 moderate, 5 high, 2 critical). Suggested remediation includes major-version upgrades; no package or lockfile changes were made.

## Final status

The production build and basic public routes work. The end-to-end shopping journey is **not launch-ready**: local auth writes are blocked by `APP_URL`/HTTPS mismatch, the real catalogue is empty, the cart cannot be edited, and payment/inventory handling has unresolved risks documented in [`AUDIT_REPORT.md`](./AUDIT_REPORT.md). No source, schema, credentials, payment code, or product records were changed during this audit.
