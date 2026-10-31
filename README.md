# ATELIER NOIR — Full-stack men's fashion commerce

A new editorial menswear e-commerce project built with Next.js App Router, TypeScript, PostgreSQL, Prisma and a server-side session model.

## Requirements

- Node.js 20.9+ (Node 22 LTS recommended)
- npm
- PostgreSQL 15+ with TLS for production
- Upstash Redis for production rate limiting
- Razorpay account for live/test payment processing

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

The development command creates a local SQLite database at `prisma/dev.db` and generates a SQLite Prisma client automatically. No `.env` file or PostgreSQL installation is needed for local development.

To recreate the local database schema and client manually, run `npm run db:local`.

For PostgreSQL deployment, configure `DATABASE_URL` using `.env.example`, then use the PostgreSQL schema:

   ```bash
   npm run db:generate
   npx prisma migrate dev --name init
   ```

Do not use the local SQLite database for production.

## Routes

- `/` — editorial storefront
- `/shop` — public product catalogue
- `/product/[slug]` — product detail and size selection
- `/cart` — signed-in customer's cart
- `/login`, `/register` — customer authentication
- `/account` — customer's order history
- `/admin/login` — separate administrator login
- `/admin` — protected admin dashboard

## Admin account

The seed script creates/updates the `INITIAL_ADMIN_EMAIL` as `SUPER_ADMIN`. Use a unique password with at least 16 characters. Run the seed command only in a controlled setup environment. Do not expose bootstrap credentials to the browser or commit `.env`.

## API overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/admin-login`
- `POST /api/auth/logout`
- `GET /api/products` (intentionally public catalogue)
- `GET /api/cart` (authenticated; own cart only)
- `POST /api/cart/items` (authenticated; own cart only)
- `GET|POST /api/admin/products` (admin only)
- `POST /api/checkout` (authenticated; Razorpay credentials required)
- `POST /api/payments/webhook` (Razorpay signature verification)

## Design system / creative tools

The storefront uses local React/CSS components, Motion for React for reduced-motion-aware reveals, and a checked color system. The original wave artwork lives in `public/atelier-wave.svg`; replace it with an exported Haikei SVG if desired.

21st.dev component retrieval uses its MCP/API key and is not configured in this workspace, so the current UI does not copy registry components. To connect it, follow the [21st.dev MCP setup guide](https://21st.dev/mcp.md) and keep the API key in VS Code's secure input flow rather than committing it. Higgsfield and Manus are optional creative tools, not app runtime dependencies. Add licensed, optimized campaign and product images from your chosen creative workflow before launch; the current hero and seeded product image URLs are placeholders.

## Before production

Read `docs/SECURITY_REVIEW.md` completely. In particular: configure Upstash, private managed PostgreSQL, TLS, daily backups and restore testing, CSP nonce hardening, Razorpay webhooks, payment timeout/refund handling, monitoring, and Gitleaks history scanning. Run:

```bash
npm run typecheck
npm test
npm run build
npm audit
```

Do not accept real payments until payment, stock reservation expiry, cancellation/refund, address validation, tax and shipping flows have been completed and tested. The included checkout is an integration foundation, not a substitute for production payment certification.
