# Implementation status

## Implemented in this workspace
- New ATELIER NOIR brand shell and responsive editorial storefront.
- Product catalogue, product detail, colour/size selection, cart, and checkout form.
- Customer registration/login and separate admin login.
- Database schema for users, sessions, products, variants, carts, orders, payments, addresses and reviews.
- Private cart endpoints, admin product creation/edit/archive and inventory controls, and customer order history.
- Password hashing, opaque DB-backed sessions, role checks, Zod validation, origin checks, rate limiting integration and security headers.
- Razorpay order creation, server-side signature/provider verification, and signed amount-checked webhook handling.
- Reduced-motion-aware Motion Primitives hero text and a brand-colored Haikei layered-wave SVG.
- Admin bootstrap seed, tests, environment template and security deployment checklist.

## Not yet implemented or verified
- Guest checkout, saved addresses, serviceability/pincode and shipping configuration, order administration, returns/refunds, coupons, wishlist, and content management.
- Image upload/storage; the admin accepts existing image URLs only.
- Production build and checks have passed in this workspace; deployment-specific behavior remains unverified.
- Actual HTTPS certificate, private database networking, backup schedule and restore test.
- Live Razorpay sandbox flows, capture/failure/refund operations, and reservation expiry/reconciliation; credentials and a configured webhook are required.
- Full Git-history secret scanning.
- Production CSP nonce rollout, WAF, monitoring and penetration testing.

Do not describe these deployment-dependent items as completed until verified.
