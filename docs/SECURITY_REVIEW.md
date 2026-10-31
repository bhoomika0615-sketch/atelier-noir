# ATELIER NOIR — Security review and deployment acceptance

This is a security-conscious starter implementation. It is **not independently penetration-tested or production-certified**. Complete every deployment-dependent item below before accepting real customer payments or personal data.

## Application controls included in source

| Control | Implementation | Verification |
|---|---|---|
| Secret handling | Server-only environment variables; `.env*` ignored; example file contains placeholders | Search tracked files and built assets for secret patterns |
| Admin authentication | Separate `/admin/login`; server checks ADMIN/SUPER_ADMIN role; bootstrap through seed command | Try customer credentials against admin login |
| Route protection | Middleware gates account/admin paths; server components and private API handlers re-check session/role | Test direct page and API access without a session |
| Session handling | Opaque random token; SHA-256 verifier stored in DB; HttpOnly, SameSite=Strict cookie; 12-hour expiry | Inspect cookie attributes in browser devtools |
| Passwords | bcrypt cost 12 | Confirm DB stores only password hashes |
| User data isolation | Account order query is scoped by authenticated user ID; cart is scoped by user ID | Attempt cross-user object-ID access |
| Input validation | Strict Zod schemas, bounded strings, numeric limits, URL validation | Run `npm test` |
| Rate limiting | Upstash sliding-window limiter; local in-memory fallback only for development; production fails closed if missing | Configure Redis and test repeated requests |
| CSRF/origin | Mutating browser routes check same-origin `Origin`; SameSite=Strict session cookie | Test cross-origin POST requests |
| Headers | HSTS, CSP, frame denial, nosniff, referrer and permissions policies | Inspect deployed response headers |
| Error disclosure | Generic API error responses; server logs details | Trigger invalid requests and inspect response |
| Payment webhook | HMAC signature validation and event idempotency | Use Razorpay test webhook events |

## Important limitations / actions before launch

1. **HTTPS:** HSTS is configured for production. Configure TLS at the hosting edge and verify redirects. Do not enable HSTS on plain-HTTP production hosting.
2. **Database network:** Use managed PostgreSQL with public access disabled or strict IP allow-listing, TLS required, least-privilege credentials, and separate development/production databases. This is a provider setting, not something application code can enforce.
3. **Backups:** Enable automated daily encrypted backups and point-in-time recovery with the database provider. Perform a restore drill and document RPO/RTO. This ZIP cannot turn on a provider backup policy.
4. **Rate limiting:** Configure Upstash Redis in production. The in-memory fallback is not distributed and must never be relied on across multiple production instances.
5. **CSP:** The starter CSP permits inline scripts for framework compatibility. For a hardened deployment, implement a per-request nonce-based CSP and remove `unsafe-inline` after verifying all scripts and styles.
6. **Admin bootstrap:** Set a unique, long initial admin password in the deployment secret store, run the seed once, then remove bootstrap credentials from the runtime environment. Never create an admin role from public registration.
7. **Payments:** Set Razorpay test credentials first, configure the webhook URL and secret, test success/failure/refund flows, then switch to live credentials. Validate shipping address fields and tax/shipping calculations before launch.
8. **Stock reservations:** Checkout atomically reserves inventory. The payment-captured webhook converts the reservation to a sale; payment-failed releases it. Add an expiry/reconciliation job for abandoned or delayed payment attempts before high-volume use. Do not treat this starter flow as complete payment operations.
9. **User ownership:** Every new private route must call `requireUser()` or `requireAdmin()` and constrain database queries by the authenticated identity. Public catalogue routes are intentionally public.
10. **Package hygiene:** Run `npm audit`, review advisories, update dependencies, run tests and build. No package audit can be claimed until dependencies are installed and scanned.
11. **Git history:** Run Gitleaks on the complete repository history before pushing. If a credential is found, revoke/rotate it; deleting it from the latest commit is not enough.
12. **Monitoring:** Add structured redacted logs, error monitoring, alerting, WAF/bot controls and an incident response procedure.

## Suggested secret scan

```bash
# Install gitleaks using its official installation instructions, then:
gitleaks detect --source . --redact --verbose

# Search tracked files for likely accidental env references:
git grep -nE '(sk_live_|rzp_live_|password=|SECRET=|API_KEY=)' || true

# Review ignored files are not tracked:
git status --ignored --short
```

Never paste real secrets into chat, source code, screenshots, or Git issues.
