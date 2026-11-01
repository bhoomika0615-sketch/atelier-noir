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

The development command starts the site at `https://localhost:3000`, creates a local SQLite database at `prisma/dev.db`, and generates a SQLite Prisma client automatically. It uses a trusted local mkcert certificate stored outside the repository. On a new Windows machine, install [mkcert](https://github.com/FiloSottile/mkcert#installation) and run `mkcert -install` once before `npm run dev`. No `.env` file or PostgreSQL installation is needed for local development.

Only run one development server at a time. If port 3000 is already serving ATELIER NOIR, keep using `https://localhost:3000`; to restart it, stop the existing server with `Ctrl+C` in its terminal before running `npm run dev` again. The dev script checks the port before Prisma runs, avoiding query-engine DLL replacement errors while another server is using the client.

To recreate the local database schema and client manually, run `npm run db:local`.

For PostgreSQL deployment, configure `DATABASE_URL` using `.env.example`, then use the PostgreSQL schema:

   ```bash
   npm run db:generate
   npx prisma migrate dev --name init
   ```

Do not use the local SQLite database for production.

## Routes

- `/` — editorial storefront
- `/shop` — searchable, sortable public product catalogue with category/collection filters and pagination
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
- `POST|PATCH|DELETE /api/cart/items` (authenticated; own cart only)
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
