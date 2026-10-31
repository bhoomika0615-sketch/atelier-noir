# ATELIER NOIR navigation and interaction audit

**Audit date:** 2026-10-31  
**Method:** Route smoke tests over local HTTPS plus source review. Product-level and authenticated actions are marked blocked when the empty catalogue or origin configuration prevented a safe test.

| Surface | Control / destination | Result | Notes |
|---|---|---|---|
| Announcement bar | Discover the new collection → `/shop` | Pass | Route returned HTTP 200. |
| Header | Home wordmark → `/` | Pass | Route exists and returned HTTP 200. |
| Header | Shop, New, Sale, Outerwear, Journal | Pass | Shop and collection routes returned HTTP 200; category links use the existing `category` query. |
| Header | Account → `/account` | Partial | Protected destination exists; unauthenticated journey redirects to login. Successful login is blocked locally by origin configuration. |
| Header | Bag → `/cart` | Partial | Cart page returns HTTP 200 and has empty/sign-in states; no test items exist. |
| Mobile header | Details menu | Inconclusive | Button is present at 390px. Browser automation timed out attempting a real click, so open/close interaction is not claimed as tested. |
| Homepage | Shop the collection | Pass | `/shop` returned HTTP 200. |
| Homepage | Available/New/Sale product rails | Empty-state pass | Three rails render empty states because the local database contains no products. No product-card links can be exercised. |
| Homepage | Outerwear, Tailoring, Essentials | Pass | Existing `/shop?category=...` destinations returned HTTP 200. |
| Homepage | Journal link | Pass | `/journal` returned HTTP 200. |
| Shop | All, New, Sale, category filters | Pass for routing | `/shop`, `/shop?collection=new`, `/shop?collection=sale`, and category destinations returned HTTP 200. Filter results cannot be verified without catalogue data. |
| Shop | Product card → `/product/[slug]` | Blocked | No product records exist to create a valid product destination. |
| Product detail | Size selection / Add to bag | Blocked | No published/in-stock products. Source review found availability mismatch and missing fetch-error feedback (see [`AUDIT_REPORT.md`](./AUDIT_REPORT.md), A-08/A-09). |
| Cart | Sign in / browse collection | Pass for routing | `/login` and `/shop` both return HTTP 200. |
| Cart | Quantity/remove controls | Missing | Current UI displays a static quantity; there is no API or UI action to update/remove items. |
| Checkout | Required address fields | Partial | Inputs have `required`, but the button is not a form submit, so browser-native validation does not run. Server-side schema validation exists. |
| Checkout | Continue to payment | Blocked | No cart data; local same-origin POST returns 403; no test payment run. |
| Authentication | Login/register/admin login submit | Blocked | A non-mutating login POST from the HTTPS origin returned 403 `Invalid request origin.` No account was created. |
| Footer | Shop, Journal, Account, Admin | Pass for routing | The public pages and admin-login destination exist; protected account/admin behavior was not authenticated. |
| Legacy rack | `/off-the-rail` | Pass | Returns 307 to `/#available-on-the-rail`, keeping the rack integrated into the storefront. |

## Internal links and coverage

The route smoke test found no broken destinations among the header, homepage, collection, account/cart, login/register, journal, and legacy rack routes. This is route-level verification only; it does not prove that product, authentication, cart, or payment transactions complete. No search, wishlist, sort control, or support/legal destinations are present in the current navigation.
