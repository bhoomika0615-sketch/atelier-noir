# ATELIER NOIR — Security Audit

## Scope and status

This audit covers the current Next.js storefront, authentication/session model, admin RBAC, product/cart APIs, checkout and webhook flow, Prisma schema setup, middleware, environment handling, and dependency posture for the existing Atelier Noir codebase.

Status: Pre-production review complete. The application includes several solid security controls, but it is not yet production-certified for real payments or customer data because there are unresolved checkout, inventory, and deployment risks.

## Executive summary

Overall risk before launch: Medium to High.

The codebase already contains meaningful protections, including:

- server-only secret handling and `.env` avoidance
- bcrypt password hashing
- opaque session tokens with DB-backed verification
- role checks for admin/customer routes
- origin validation for mutating requests
- generic API error handling
- HSTS, security headers, and full route isolation patterns
- Razorpay webhook signature verification and event idempotency logic

However, the application is still not ready for live commerce because of:

- reservation and stock lifecycle issues in the payment flow
- no production-tested payment failure/refund workflows
- dependency advisories in the current install set
- deployment hardening gaps around TLS, Redis, backups, and secret rotation
- no final production security review from a provider-specific or compliance-specific standpoint

## Severity summary

| Severity | Finding | Status |
|---|---|---|
| High | Checkout and stock reservation lifecycle is not business-safe for production use | Open |
| High | Payment failures and webhook ordering errors can leave inconsistent order/inventory state | Open |
| High | Dependency advisories require review before release | Open |
| Medium | Production secrets and environment configuration remain deployment-dependent | Open |
| Medium | Rate limiting and firewall protections are not fully production-configured | Open |
| Medium | CSP hardening is not yet complete for a strict production deployment | Open |
| Low | Local dev-mode fallback patterns must not be trusted in production | Open |

## Findings by area

### 1) Authentication and session security

Status: Mostly implemented, but final deployment verification still required.

Strengths:

- password hashing uses bcrypt
- admin/customer separation is implemented
- middleware and private route checks exist
- session cookies use a secure pattern with `HttpOnly` and `SameSite` behavior

Remaining checks:

- confirm cookie attributes in production TLS environment
- verify admin bootstrap credentials are removed after initial setup
- test invalid session and role escalation attempts
- confirm no user data is exposed in account/admin queries without ownership checks

### 2) API validation and abuse prevention

Status: Implemented with guardrails; not fully production-hardened.

Strengths:

- strict Zod validation on registration, login, cart, product, shipping and admin flows
- bounded payload sizes and parameter checks
- same-origin checks for mutating browser requests
- generic error responses to avoid internal leak-through

Remaining checks:

- validate all admin and checkout routes with focused abuse tests
- verify rate limiting behaves correctly in a multi-instance deployment
- confirm upstream proxies do not strip security headers or `Origin` headers

### 3) Payment and checkout

Status: High-risk; not production-acceptable.

The current implementation contains the basic infrastructure for a checkout and Razorpay webhook flow, but the business and accounting logic is not yet robust enough for live use.

Risks include:

- payment failures and cancellations can leave reservation state inconsistent
- out-of-order webhook events are not sufficiently protected against invalid state transitions
- total/cart-clearing logic is incomplete or ambiguous
- repeated checkout attempts may create duplicate reservation events
- late webhook settlement and refund semantics are not fully defined

Required before launch:

- formal payment lifecycle rules
- reservation expiry and reconciliation process
- provider failure compensation logic
- payment retry and duplicate payment handling
- shipping/tax calculation policy
- refund/cancellation and status mapping

### 4) Inventory and cart integrity

Status: Not yet production-safe.

The application models inventory reservations and cart quantities, but production-grade consistency requires transaction boundaries and reconciliation. The cart is not enough on its own; inventory must be reconciled across payment success, failure, cancellations, and webhook retries.

Required controls:

- atomic inventory reservation workflow
- reservation expiry and reconciliation job
- explicit transition rules for failed vs captured payments
- no cart clearing until payment status has been safely resolved

### 5) Secrets and environment management

Status: Mostly correct at source level, but environment preparation remains required.

Strengths:

- `.env*` is ignored
- example secret templates are provided
- server environment variables are expected to stay server-only

Outstanding items:

- configure real provider secrets only in secure secret stores
- rotate any bootstrap admin credentials after the initial seed
- verify no secrets are present in git history or logs
- configure separate production and development credentials

### 6) Network, TLS, and hosting protection

Status: Deployment-dependent and not complete in this repository.

Necessary steps before production launch:

- TLS termination at the edge or application host
- HSTS enforcement only on HTTPS-enabled production domains
- managed PostgreSQL with private networking and TLS
- automated encrypted backups and restore drills
- WAF and bot protections where relevant
- monitoring and alerting for failed payment or auth events

### 7) Dependency posture

Status: Requires follow-up review and patching before release.

The project currently reports advisories in dependency usage. The repo has a valid `npm audit` command, but it should be used with a compatibility review rather than a blanket forced upgrade.

Actions:

- review advisories individually
- patch only the safe compatibility set
- validate the app after any dependency upgrade
- avoid broad, forceful upgrades that break Prisma, Next.js, or auth/session logic

### 8) CSP and frontend hardening

Status: Partial implementation.

The codebase includes security headers and general protections, but a hardened production deployment needs a more strict, nonce-based CSP process. Inline script allowances are acceptable in some framework scenarios, but they are not the strongest final state for a production commerce deployment.

## Recommended launch gate

Do not accept live customer payments or real personal data until all of the following are true:

1. Payment lifecycle, reservation expiry and refund rules are explicitly approved.
2. Checkout/webhook tests pass in Razorpay test mode.
3. Inventory transitions are verified across success/failure/refund scenarios.
4. Dependency advisories are reviewed and any required updates are validated.
5. Production secrets are configured via a secure secret manager.
6. TLS, Redis, backups, monitoring, and logging are fully configured.
7. Admin bootstrap credentials are rotated and removed from the runtime environment.
8. Security headers and CSP are validated in the final production deployment.

## Final assessment

The codebase is a solid foundation for a premium ecommerce app, and the security architecture is more mature than a typical starter project. However, the current checkout, payment, and production-hardening state still falls short of a production-ready commerce platform.

The project should proceed to implementation only after the business/payment rules are approved and the security gates above are satisfied.
