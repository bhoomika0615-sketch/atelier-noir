# ATELIER NOIR — Claude handoff

## Project status

This repository is in the audit / planning phase for a premium storefront enhancement. The project itself is not a blank slate; it already contains an App Router Next.js storefront, Prisma data layer, auth/session model, admin dashboard, cart, checkout scaffolding, and product APIs.

The key objective is to preserve the current architecture and enhance it without replacing core systems.

## What has already been completed

- source audit of the current application structure
- feature-by-feature classification of implementation status
- initial implementation roadmap with prioritized batches
- declarative guardrails for preserving the existing architecture
- security review notes and deployment risk assessment

## Files of interest

- `AUDIT_REPORT.md` — primary audit summary and feature classification
- `IMPLEMENTATION_PLAN.md` — prioritized implementation roadmap
- `IMPLEMENTATION_STATUS.md` — live status board of current readiness
- `SECURITY_AUDIT.md` — security-specific findings and launch gate
- `README.md` — project setup and route overview
- `docs/SECURITY_REVIEW.md` — deeper production deployment checklist

## High-priority implementation order

### 1) Payment and stock lifecycle

This is the most important risk area and should be addressed first. The current checkout payment flow needs explicit business rules before code changes are treated as production-safe.

Focus areas:

- webhook ordering and idempotency
- failed payment releases and compensation
- reservation expiry and cleanup
- duplicate prevention for repeated checkout attempts
- final order state machine
- taxes/shipping policy and cart-clearing logic

Files likely involved:

- `src/app/api/checkout/route.ts`
- `src/app/api/payments/webhook/route.ts`
- `src/components/checkout-form.tsx`
- Prisma schema and related migrations only if required by business rules

### 2) Admin product lifecycle

The admin dashboard exists, but the product creation flow is not complete enough for a reliable e-commerce lifecycle.

Focus areas:

- product/editor variants
- inventory/stock handling
- compare-at pricing
- publish flow
- admin API correctness and scope checks

Files likely involved:

- `src/app/api/admin/products/route.ts`
- `src/lib/validation.ts`
- `src/app/admin/page.tsx`

### 3) Shared storefront polish

Once the business-critical flows are stable, improve the public experience without changing the architecture.

Focus areas:

- premium editorial design
- header/footer and navigation polish
- responsive behavior
- motion and scroll animation
- hover and focus states
- accessibility improvements

Files likely involved:

- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/components/site-header.tsx`
- `src/components/site-footer.tsx`
- route-level components

### 4) SEO, legal, and support content

Only after verified business details are supplied should public support pages and metadata be implemented.

Focus areas:

- metadata per route
- privacy and terms pages
- shipping and returns pages
- contact and FAQ content
- canonical and social metadata

### 5) Analytics and consent

Only after the client chooses a provider and consent rules are agreed.

Focus areas:

- consent UI and storage
- analytics provider integration
- UTM retention and campaign tracking
- no analytics fire before consent

## Guardrails for all future work

- Preserve the existing Next.js App Router and Prisma architecture.
- Do not replace the auth, database, or admin model with a mock or alternate system.
- Do not enable live payments before payment rules are tested in test mode.
- Keep code changes surgical and reviewable.
- Preserve current uncommitted work in the repo.
- Avoid fabricating legal, contact, or business details without explicit approval.

## Known blockers

The following items remain externally or commercially dependent:

- exact shipping/tax/refund policy
- verified business contact data
- final approved product/media assets
- payment provider test-mode configuration and webhook setup
- analytics provider choice and consent requirements

## Recommended next step

Proceed with the payment/stock lifecycle work first, with explicit documentation of the business rules before touching live checkout behavior. Once those rules are approved and tested, continue with admin catalog capabilities and then premium storefront refinement.

This is the correct sequence because the public storefront design is valuable but must not be prioritized over trust, payment correctness, and inventory integrity.

## Success criteria for the next implementation batch

- checkout flow is state-safe and idempotent
- stock reservation and release logic is correct under failure conditions
- payment webhooks do not corrupt order status
- admin product management is correct and secure
- browser-level checks pass for key storefront interactions
- no new critical security issues are introduced
