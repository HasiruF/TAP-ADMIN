# TAP Admin — Project Structure Analysis

> Last verified: 2026-07-31, against the working tree (`src/` as currently on disk).

---

## 1. Directory Tree

```
tap-admin/
├── public/
│   ├── Primary.svg              # TAP logo (favicon + sidebar)
│   ├── Variation1.svg
│   ├── Variation2.svg
│   └── (default Next.js SVGs)
├── src/
│   ├── app/                     # Next.js App Router root
│   │   ├── layout.tsx           # Root layout (fonts, QueryProvider, AuthProvider, Sonner Toaster)
│   │   ├── page.tsx             # Root page → redirects to /login
│   │   ├── globals.css          # Global CSS / design tokens
│   │   ├── favicon.ico
│   │   ├── login/
│   │   │   ├── page.tsx         # Server wrapper (sets <title>) → renders LoginClient
│   │   │   └── LoginClient.tsx  # Login form, real POST /auth/email/login
│   │   ├── admin/
│   │   │   ├── layout.tsx       # Admin shell (SidebarProvider + AppSidebar)
│   │   │   ├── page.tsx         # /admin — thin wrapper, renders stats + <AnalyticsOverview>
│   │   │   ├── OverviewClient.tsx
│   │   │   ├── log/
│   │   │   │   ├── page.tsx
│   │   │   │   └── LogClient.tsx        # /admin/log — Activity log viewer (reads ?userId=&name=)
│   │   │   ├── messages/
│   │   │   │   ├── page.tsx
│   │   │   │   └── MessagesClient.tsx   # /admin/messages — Message moderation
│   │   │   ├── moderation/
│   │   │   │   ├── page.tsx
│   │   │   │   └── ModerationClient.tsx # /admin/moderation — Content moderation queue
│   │   │   ├── resources/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── ResourcesClient.tsx  # /admin/resources — Resource management
│   │   │   │   └── SortableRow.tsx
│   │   │   ├── vendors/
│   │   │   │   ├── page.tsx
│   │   │   │   └── VendorsClient.tsx    # /admin/vendors — Marketplace vendor categories + listings
│   │   │   └── users/
│   │   │       ├── page.tsx             # /admin/users
│   │   │       ├── UsersClient.tsx      # renders <UserManagementTable>
│   │   │       ├── artist/[id]/
│   │   │       │   ├── page.tsx
│   │   │       │   └── ArtistDetailClient.tsx      # Artist profile inspection
│   │   │       ├── artistapproval/[id]/
│   │   │       │   ├── page.tsx
│   │   │       │   └── ArtistApprovalClient.tsx    # Artist approval decision screen
│   │   │       ├── venue/[id]/
│   │   │       │   ├── page.tsx
│   │   │       │   └── VenueDetailClient.tsx       # Venue profile inspection
│   │   │       └── venueapproval/[id]/
│   │   │           ├── page.tsx
│   │   │           └── VenueApprovalClient.tsx     # Venue approval decision screen
│   │   └── api/
│   │       └── health/
│   │           └── route.ts     # GET /api/health — liveness probe for ALB/ECS only, never calls the backend
│   ├── components/
│   │   ├── admin/
│   │   │   ├── layout/SideBar.tsx
│   │   │   ├── messages/MessageThread.tsx
│   │   │   ├── moderation/
│   │   │   │   ├── ModerationPreviewDialog.tsx
│   │   │   │   ├── ModerationQueueTable.tsx
│   │   │   │   └── RejectReasonDialog.tsx
│   │   │   ├── overview/
│   │   │   │   ├── AnalyticsOverview.tsx
│   │   │   │   ├── UserGrowthChart.tsx
│   │   │   │   ├── ArtistGenreChart.tsx
│   │   │   │   ├── ArtistLocationChart.tsx
│   │   │   │   └── shared.tsx
│   │   │   ├── resources/
│   │   │   │   ├── CreateResourceDialog.tsx
│   │   │   │   └── ViewResourceDialog.tsx
│   │   │   ├── shared/
│   │   │   │   ├── ReasonPromptDialog.tsx      # generic "reason required" dialog (suspend/ban)
│   │   │   │   └── RegionSuggestionsPanel.tsx  # venue-submitted region suggestions, add/dismiss
│   │   │   ├── users/UserManagementTable.tsx
│   │   │   └── vendors/
│   │   │       ├── CategoriesTable.tsx
│   │   │       ├── CategoryDialog.tsx
│   │   │       ├── ListingsTable.tsx
│   │   │       └── ListingDialog.tsx
│   │   └── ui/                  # shadcn/ui primitives
│   │       ├── avatar, badge, button, card, chart, dialog
│   │       ├── dropdown-menu, input, label, radio-group
│   │       ├── scroll-area, select, separator, sheet
│   │       ├── sidebar, skeleton, table, tabs
│   │       ├── textarea, tooltip
│   ├── data_mock/               # LEGACY — no longer imported by any live route.
│   │   │                        # Kept as fixtures only (activityLogs.ts, artists.ts,
│   │   │                        # moderation.ts, users.ts, venues.ts).
│   ├── features/
│   │   └── auth/
│   │       ├── api.ts           # authApi.login/me/logout — thin wrappers over api()
│   │       └── hooks.ts         # useMe / useLogin / useLogout (React Query)
│   ├── hooks/
│   │   ├── queries/              # TanStack Query hooks, one per resource
│   │   │   ├── useAdminAnalytics.ts   # useUserGrowth / useArtistGenreDistribution / useArtistLocationDistribution
│   │   │   ├── useAdminArtists.ts
│   │   │   ├── useAdminConversations.ts
│   │   │   ├── useAdminLogs.ts
│   │   │   ├── useAdminMessages.ts
│   │   │   ├── useAdminOverview.ts
│   │   │   ├── useAdminUsers.ts
│   │   │   ├── useAdminVenues.ts
│   │   │   ├── useModerationActions.ts
│   │   │   ├── useModerationQueue.ts
│   │   │   ├── useResources.ts
│   │   │   ├── useUpdateResources.ts
│   │   │   ├── useUploadFiles.ts
│   │   │   ├── useVendorCategories.ts
│   │   │   ├── useVendorListingPhotos.ts
│   │   │   └── useVendorListings.ts
│   │   └── use-mobile.ts
│   ├── lib/
│   │   ├── api/
│   │   │   ├── admin/            # Fetch wrappers, one per backend resource — no relative-URL
│   │   │   │   │                 # BFF calls, every function hits NEXT_PUBLIC_API_URL directly.
│   │   │   │   ├── analytics.ts
│   │   │   │   ├── artists.ts
│   │   │   │   ├── conversations.ts
│   │   │   │   ├── logs.ts
│   │   │   │   ├── mediaAssets.ts
│   │   │   │   ├── messages.ts
│   │   │   │   ├── moderation.ts
│   │   │   │   ├── overview.ts
│   │   │   │   ├── resources.ts
│   │   │   │   ├── uploadfiles.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── vendorCategories.ts
│   │   │   │   ├── vendorListingPhotos.ts
│   │   │   │   ├── vendorListings.ts
│   │   │   │   └── venues.ts
│   │   │   ├── auth/
│   │   │   │   └── AuthContext.tsx   # AuthProvider / useAuthContext
│   │   │   ├── auth.ts               # forgotPassword(), refresh() (token refresh)
│   │   │   ├── client.ts             # api() — the one fetch wrapper everything else calls; owns the in-memory access token
│   │   │   ├── errorMessage.ts       # getFriendlyErrorMessage() — maps backend error shapes to UI copy
│   │   │   └── media.ts              # uploadMedia() — multipart upload helper
│   │   ├── artist/
│   │   │   └── streamingLinks.ts     # splitReleases(), STREAMING_PLATFORMS, platformLabel()
│   │   ├── providers/
│   │   │   └── QueryProvider.tsx
│   │   ├── schemas/
│   │   │   ├── loginSchema.ts        # zod schema for LoginClient
│   │   │   └── resourceSchema.ts
│   │   ├── utils/
│   │   │   ├── compressImage.ts
│   │   │   ├── date.ts               # formatDateTime()
│   │   │   └── performanceType.ts    # formatPerformanceType()
│   │   ├── formatters.ts             # formatBudget()
│   │   └── utils.ts                  # cn() (clsx + tailwind-merge)
│   ├── types/
│   │   ├── authuser.ts
│   │   ├── conversation.ts
│   │   ├── logs.ts
│   │   ├── resource.ts
│   │   ├── user.ts                   # User, UserBe, mapUserToBe()
│   │   └── vendor.ts
│   ├── utils/
│   │   └── AdminRoutes.ts            # getAdminUserRoute(), getAdminLogRoute()
│   ├── middleware.ts                 # standard Next.js middleware (not renamed/relocated)
│   └── _tests_/
│       ├── authContext.test.tsx
│       └── client.test.ts
├── components.json              # shadcn/ui config
├── next.config.ts               # output: 'standalone'; images.remotePatterns for backend/localstack hosts
├── tsconfig.json
├── eslint.config.mjs
├── .prettierrc
├── .husky/pre-commit             # lint-staged hook
├── Dockerfile
└── docker-compose.yml
```

**Note on `src/data_mock/`:** these fixture files still exist on disk but are
**not imported by any route, hook, or component** anymore (verified by
search — nothing under `src/app`, `src/hooks`, or `src/lib` references
`data_mock`). Every screen fetches from the live backend. Treat this
directory as dead weight / historical leftovers, not as evidence that any
screen is still mock-backed.

---

## 2. Framework & Key Dependencies

| Category | Choice |
|---|---|
| **Framework** | Next.js `^15.5.19` (App Router). `eslint-config-next` is pinned to `16.2.6` — intentionally ahead of the `next` version, not a bug. |
| **React** | 19.2.4 |
| **Language** | TypeScript 5 |
| **UI Library** | shadcn/ui (components.json configured) built on `radix-ui` (single unified package) |
| **Styling** | Tailwind CSS v4 + `tw-animate-css` + CSS variables for design tokens |
| **State Management** | None — server state only via TanStack React Query v5 |
| **Data Fetching** | TanStack Query v5 (`@tanstack/react-query`) |
| **Forms / Validation** | `react-hook-form` + `@hookform/resolvers` (zod) + `zod` — used on Login and Resources |
| **Charts** | Recharts v3 — user growth line chart, artist genre/location distribution charts |
| **Icons** | Lucide React v1.14 |
| **Drag & Drop** | `@dnd-kit/core` + `@dnd-kit/sortable` (Resources page, reorder is persisted — see §3) |
| **Animation** | Framer Motion v12 |
| **Date Formatting** | date-fns v4 |
| **Toasts** | Sonner v2 (mounted globally in root layout) |
| **Linting / Formatting** | ESLint 9 + Prettier 3 + Husky + lint-staged |
| **Testing** | Jest 30 + Testing Library (`src/_tests_/`, 2 test files) |
| **Containerisation** | Docker (multi-stage, `output: 'standalone'`) + docker-compose |

---

## 3. API Call Architecture

**There is no Backend-For-Frontend layer.** The browser calls the real TAP
backend directly. The pattern is a 3-layer stack:

**page/client component → React Query hook (`src/hooks/queries/`) → fetch
wrapper (`src/lib/api/admin/*.ts` or `src/features/auth/api.ts`) → `api()`
in `src/lib/api/client.ts` → `${NEXT_PUBLIC_API_URL}${path}`**

- `api()` attaches `Authorization: Bearer <in-memory access token>`,
  proactively refreshes the token before it expires, and retries once on a
  401 by refreshing reactively (see §4).
- Almost every wrapper hits `/admin/...` (e.g. `/admin/users`,
  `/admin/artist/:id`, `/admin/moderation`) — these are real NestJS backend
  routes, not local Next.js routes.
- The vendor marketplace wrappers (`vendorCategories.ts`, `vendorListings.ts`,
  `vendorListingPhotos.ts`) call `/vendors/...` instead of `/admin/vendors/...`.
- File/media uploads (`mediaAssets.ts`, `uploadfiles.ts`) POST multipart
  `FormData` to `/media-assets/upload` and `/files/upload` respectively —
  they bypass `api()` because it always sets a JSON `Content-Type` header,
  which must not be set for `FormData` requests.
- The **only** route under `src/app/api/**` is `GET /api/health`
  (`src/app/api/health/route.ts`) — a static liveness check for the ALB/ECS
  target group. It returns `{ status: 'ok' }` and never calls the backend.

### Mutations are wired to real endpoints

Contrary to older analyses of this codebase, admin actions are **not**
UI-only anymore:

| Action | Wrapper | Endpoint |
|---|---|---|
| Approve/reject artist | `artists.ts` | `POST /admin/user/approve`, `POST /admin/user/reject` |
| Suspend artist/venue/user | `users.ts` | `POST /admin/user/suspend` |
| Unsuspend | `users.ts` | `POST /admin/user/unsuspend` |
| Ban | `users.ts` | `POST /admin/user/ban` |
| Unlock | `users.ts` | `PATCH /admin/users/:id/unlock` |
| Approve/reject venue | `venues.ts` | `POST /admin/venue/approve`, `POST /admin/venue/reject` |
| Region suggestion add/dismiss | `venues.ts` | `POST /admin/venue/region-suggestions/add|dismiss` |
| Mint artist preview link | `artists.ts` | `POST /admin/artist/:id/preview-token` |
| Moderation approve/reject | `moderation.ts` | `POST /admin/moderation/approve`, `POST /admin/moderation/reject` |
| Resources bulk save/reorder | `resources.ts` | `PUT /admin/resources` |
| Vendor category/listing CRUD | `vendorCategories.ts` / `vendorListings.ts` | `POST/PATCH/DELETE /vendors/categories`, `/vendors/listings` |
| Password reset (admin-triggered) | `auth.ts` | `POST /auth/forgot/password` |

`requestArtistChanges()` still exists in `src/lib/api/admin/artists.ts` but
is **not called from any component** — the "Request Changes" three-way
decision described in older docs has been reduced to a two-way
Approve/Reject decision in the current UI.

---

## 4. Authentication & Session Management

**Current state: fully implemented (JWT against the real backend).**
Centralised in `<AuthProvider>` / `useAuthContext()`
([src/lib/api/auth/AuthContext.tsx](src/lib/api/auth/AuthContext.tsx)),
mounted in the root layout.

**Token storage model:**
- **Access token → in-memory only** (module variable in
  [src/lib/api/client.ts](src/lib/api/client.ts)). Never persisted to
  cookies/localStorage; restored on reload via the refresh token.
- **Refresh token → `localStorage`** (`tap_refresh_token`) so sessions
  survive reloads.
- **`tap_session` + `tap_role` → marker cookies** (client-set, `SameSite=Lax`,
  `Secure` in prod). Non-secret flags used **only** by middleware; the
  backend still enforces `@Roles(admin)` on every admin endpoint
  independently.

**Flow:**
- **Login** (`src/app/login/LoginClient.tsx`) → `POST /auth/email/login` →
  rejects non-`admin` roles client-side → `setSession(token, user,
  refreshToken, tokenExpires)` stores the token in memory, refresh token in
  localStorage, sets the marker cookies.
- **Session restore** — on app load `AuthProvider` calls `refresh()` once,
  then `authApi.me()` (`GET /auth/me`) to hydrate `user`; non-admin sessions
  are discarded (`clearAuthState()`), never granted the admin shell. Admin
  queries are gated on `!isLoading` so nothing fires before restore
  completes.
- **Refresh** — `api()` refreshes proactively before expiry and reactively
  on 401, both through a shared `refreshWithLock()` (single in-flight
  refresh). Any failure calls `clearAuthState()` (wipes in-memory token +
  `tap_refresh_token` + both cookies).
- **Route protection** — [src/middleware.ts](src/middleware.ts), matcher
  `/admin/:path*` and `/login`, requires both `tap_session` present **and**
  `tap_role === 'admin'`; a stale non-admin session is bounced to `/login`
  and its marker cookies deleted.
- **Logout** — `useAuthContext().logout()` → `POST /auth/logout` then
  `clearAuthState()` (sidebar footer button).
- **Admin-triggered password reset** — `forgotPassword(email)` →
  `POST /auth/forgot/password`, used from the Artist/Venue detail and
  approval pages' "Reset Password" action.

**Known limitations (documented in-code, `AuthContext.tsx` threat-model
comment):**
- Refresh token in `localStorage` is XSS-readable; hardening would move it
  to a backend-issued HttpOnly Secure cookie + CSP.
- `tap_session`/`tap_role` are client-trusted markers, not server-validated
  sessions — the backend re-validates role independently.

---

## 5. Routing Structure

All routing uses Next.js App Router file-based routing.

| URL | Page File | Screen Description |
|---|---|---|
| `/` | `src/app/page.tsx` | Redirects to `/login` |
| `/login` | `src/app/login/LoginClient.tsx` | Login form, real backend auth, admin-role gate |
| `/admin` | `src/app/admin/OverviewClient.tsx` | Overview dashboard — live stat cards + analytics charts |
| `/admin/users` | `src/app/admin/users/UsersClient.tsx` | User management table (all users, paginated server-side) |
| `/admin/users/artist/[id]` | `.../artist/[id]/ArtistDetailClient.tsx` | Artist profile inspection + suspend/ban/unlock/reset-password |
| `/admin/users/artistapproval/[id]` | `.../artistapproval/[id]/ArtistApprovalClient.tsx` | Artist approval screen (Approve / Reject with required feedback) |
| `/admin/users/venue/[id]` | `.../venue/[id]/VenueDetailClient.tsx` | Venue profile inspection + region suggestions panel |
| `/admin/users/venueapproval/[id]` | `.../venueapproval/[id]/VenueApprovalClient.tsx` | Venue approval screen (Approve / Reject with required feedback) |
| `/admin/moderation` | `src/app/admin/moderation/ModerationClient.tsx` | Content moderation queue (images/video, approve/reject with reason) |
| `/admin/messages` | `src/app/admin/messages/MessagesClient.tsx` | Message moderation — read-only artist↔venue conversation viewer |
| `/admin/log` | `src/app/admin/log/LogClient.tsx` | Activity log viewer — `?userId=&name=` scopes to one user, otherwise shows all activity |
| `/admin/resources` | `src/app/admin/resources/ResourcesClient.tsx` | Resource management with drag-to-reorder (persisted) |
| `/admin/vendors` | `src/app/admin/vendors/VendorsClient.tsx` | Marketplace vendor category taxonomy + listings CRUD |
| `/api/health` | `src/app/api/health/route.ts` | Liveness probe, not a UI route |

There are no more "stub" `/admin/users/artist`, `/venue`, `/artistapproval`,
`/venueapproval` list routes without an `[id]` segment — the current file
tree only has the dynamic `[id]` routes under each of those four folders.

**Route helper:** `src/utils/AdminRoutes.ts`:
- `getAdminUserRoute(user)` — routes to the correct detail or approval page
  based on a user's `role` and `status`. Used by `UserManagementTable` to
  navigate on row click.
- `getAdminLogRoute(user)` — builds `/admin/log?userId=<id>&name=<name>` so
  the "view logs" action opens that specific user's activity, not the global
  feed.

**Sidebar nav (two groups, `src/components/admin/layout/SideBar.tsx`):**
- **Management:** Overview (`/admin`) · User Management (`/admin/users`) ·
  Content Moderation (`/admin/moderation`) · Activity Logs (`/admin/log`) ·
  Message Moderation (`/admin/messages`)
- **Marketplace:** Resources (`/admin/resources`) · Products & Services
  (`/admin/vendors`)

---

## 6. Environment Variables

`.env` and `.env.local` exist in the repo (both gitignored). Currently set:

```bash
# .env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# .env.local
PUBLIC_API_URL=http://localhost:3000/api/v1   # unused — not NEXT_PUBLIC_-prefixed, never read
```

The app reads exactly two env vars at build time, both via `process.env.*`
inlined into the client bundle (no `next.config.ts` `env`/
`publicRuntimeConfig` block is needed or used):

| Variable | Used by | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `src/lib/api/client.ts`, `auth.ts`, `media.ts`, `admin/mediaAssets.ts`, `admin/moderation.ts` (origin-stripped, to resolve relative content links), and several detail-page components (image URL resolution) | Base URL for every backend API call |
| `NEXT_PUBLIC_PLATFORM_URL` | `VenueDetailClient.tsx` | Builds the "view live profile" link to the public marketing site for approved venues |

`BACKEND_API_URL` is set in the ECS task definition and `docker-compose.yml`
but is **not read anywhere in `src/`** — it's a leftover from a
now-removed server-side BFF layer (see §3 and [DEPLOYMENT.md](DEPLOYMENT.md)).

`next.config.ts` also configures `images.remotePatterns` for
`localhost:3001` (backend dev), `localhost:4566` (LocalStack, dev S3), and
`https://**` (any HTTPS host, e.g. production S3/CDN URLs).

---

## 7. Remaining Hardcoded / Notable Items

- **Preview links are dynamic, not hardcoded.** The old Figma-prototype
  "Show Preview" placeholder is gone. Artist pages mint a one-time preview
  token (`mintArtistPreviewLink` → `POST /admin/artist/:id/preview-token`);
  the venue detail page links straight to
  `${NEXT_PUBLIC_PLATFORM_URL}/venues/${slug}` when the venue is
  `marketplaceUnlocked`.
- **Activity log is user-contextual.** `/admin/log` reads `?userId=` and
  `?name=` from the query string (set by `getAdminLogRoute`) and calls
  `fetchAdminLogs(userId)`; with no `userId` it shows the platform-wide feed.
- **Admin actions call real endpoints** — see the table in §3. This
  supersedes older documentation describing every action button as
  UI-only/`console.log`.
- **Resource reorder is persisted.** `useUpdateResources()` issues a
  `PUT /admin/resources` bulk-replace on drop, syncing local dnd-kit state
  back to the server; it is not local-only.
- **`src/data_mock/`** is unused dead weight (see §1) — do not treat its
  presence as evidence any screen still serves mock data.
