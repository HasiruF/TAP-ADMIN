<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## TAP Admin-specific landmines (verified 2026-07-31)

- **This app has no BFF/proxy API routes.** `src/lib/api/client.ts`'s `api()` calls the real TAP backend directly from the browser at `NEXT_PUBLIC_API_URL` (baked in at build time). The only route under `src/app/api/**` is `src/app/api/health/route.ts`, a local liveness probe for the ECS/ALB health check — it never touches the backend. Do not add `BACKEND_API_URL`-based route handlers expecting them to be wired up; that pattern was removed.
- **Middleware is the standard `src/middleware.ts` exporting `middleware`** (unlike some other TAP repos that rename this file). It gates `/admin/:path*` and `/login` on two non-secret marker cookies, `tap_session` and `tap_role` — it does not itself validate a session; the backend enforces `@Roles(admin)` on every admin endpoint.
- **Tokens:** access token is in-memory only (`src/lib/api/client.ts` module state, never persisted); refresh token lives in `localStorage['tap_refresh_token']`. `tap_session`/`tap_role` cookies are client-set convenience flags for middleware only.
- **Marketplace/vendor endpoints live under `/vendors/*`**, not `/admin/vendors/*` — see `src/lib/api/admin/vendorCategories.ts` and `vendorListings.ts`.
- **`eslint-config-next` (16.2.6) is intentionally ahead of `next` (^15.5.19)** in `package.json` — don't "fix" this as a mismatch without checking with the team first.
