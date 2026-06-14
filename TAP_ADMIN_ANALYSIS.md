# TAP Admin — Codebase Analysis

> Generated from a full read of the source under `src/`. Every claim below is drawn from the actual code, not assumptions. Where the code is incomplete, mocked, or inconsistent, this is called out explicitly.

---

## 1. Project Overview

**TAP Admin** is the internal administration dashboard for the TAP platform — a marketplace that connects **Artists** (musicians/performers) with **Venues**. The admin panel is the back-office tool used by platform administrators to govern that marketplace.

- **Who uses it:** Admin staff only. There is no artist/venue-facing UI here. The middleware forces every non-`/login` route behind authentication, and the `me` endpoint hard-codes/derives the `admin` role. Artist and Venue records only ever appear here as *subjects* of moderation/approval, never as logged-in users.
- **What it does:**
  - **Overview dashboard** — platform stat cards (artist/venue totals, pending approvals) + a growth chart.
  - **User management** — paginated, role-filtered table of all users with inline approve/suspend/unsuspend/ban actions.
  - **Artist & Venue approval** — full profile inspection screens with Approve / Decline / Request Changes decisions and admin feedback.
  - **Artist & Venue inspection** — read-only profile views for already-approved users, plus suspend / reset-password actions.
  - **Content moderation queue** — review queue for user-submitted media/links with approve/reject and a preview dialog.
  - **Message moderation** — read-only viewer of artist↔venue conversation threads.
  - **Help resources management** — CRUD + drag-to-reorder list of learning resources (YouTube / website / PDF) pushed to artists & venues.
  - **Activity logs** — per-user activity/audit log view.

- **Architecture in one line:** A Next.js 15 App Router app where the browser talks to React Query hooks → a thin client `api()` wrapper that hits an external **TAP backend** directly (`NEXT_PUBLIC_API_URL`), *except* a handful of features that proxy through Next.js Route Handlers (`/api/...` → `backendFetch` → `BACKEND_API_URL`). The two patterns coexist (see §5/§6 for the inconsistency).

---

## 2. Tech Stack

Read from [package.json](package.json). App is `tap-admin` v0.1.0, private.

### Core framework / language
| Package | Version | Role |
|---|---|---|
| `next` | ^15.5.19 | App Router framework |
| `react` / `react-dom` | 19.2.4 | UI runtime (React 19 — uses `use()` for params) |
| `typescript` | ^5 | Language |

> ⚠️ Note: [AGENTS.md](AGENTS.md) warns this is a non-standard Next.js with breaking changes and instructs reading `node_modules/next/dist/docs/` before writing code. `eslint-config-next` is pinned to `16.2.6` while `next` is `15.x`.

### Data / state / forms
| Package | Version | Role |
|---|---|---|
| `@tanstack/react-query` | ^5.100.14 | Server-state, all data fetching |
| `@tanstack/react-query-devtools` | ^5.100.14 | Devtools panel |
| `react-hook-form` | ^7.77.0 | Forms (login, resources) |
| `@hookform/resolvers` | ^5.4.0 | Zod resolver bridge |
| `zod` | ^4.4.3 | Schema validation (`z.email`, `z.url`, discriminated unions) |

### UI / styling
| Package | Version | Role |
|---|---|---|
| `tailwindcss` / `@tailwindcss/postcss` | ^4 | Styling (Tailwind v4) |
| `radix-ui` | ^1.4.3 | Headless primitives (single unified pkg) |
| `shadcn` | ^4.7.0 | Component generator/registry (`components.json`) |
| `class-variance-authority` | ^0.7.1 | Variant styling (buttons, badges) |
| `clsx` + `tailwind-merge` | ^2.1.1 / ^3.6.0 | `cn()` helper ([src/lib/utils.ts](src/lib/utils.ts)) |
| `tw-animate-css` | ^1.4.0 | Animations |
| `lucide-react` | ^1.14.0 | Icons |
| `framer-motion` | ^12.38.0 | Animation (installed; minimal direct use found) |
| `recharts` | ^3.8.1 | Growth chart |
| `sonner` | ^2.0.7 | Toasts (installed) |
| `react-day-picker` | ^10.0.0 | Date picker (installed) |

### Drag & drop
| Package | Version | Role |
|---|---|---|
| `@dnd-kit/core` | ^6.3.1 | DnD context for resource reordering |
| `@dnd-kit/sortable` | ^10.0.0 | Sortable list strategy |
| `@dnd-kit/utilities` | ^3.2.2 | CSS transform helpers |

### Utilities / tooling
| Package | Version | Role |
|---|---|---|
| `date-fns` | ^4.1.0 | Date formatting (`format`) |
| `eslint` ^9 / `eslint-config-next` 16.2.6 | Linting |
| `prettier` ^3.8.3 | Formatting |
| `husky` ^9.1.7 + `lint-staged` ^17.0.7 | Pre-commit hook (prettier + eslint --fix) |

Also shipped: `Dockerfile`, `docker-compose.yml`, npm scripts `docker:build` / `docker:run`.

---

## 3. Folder Structure (annotated)

```
tap-admin/
├── AGENTS.md / CLAUDE.md          # Project agent instructions (CLAUDE.md → @AGENTS.md)
├── components.json                # shadcn config
├── next.config.ts                 # next/image remotePatterns (localhost:3001 + https **)
├── Dockerfile / docker-compose.yml
├── tap_admin_*.md                 # Design/spec docs (data contracts, workflows, gap analysis…)
├── public/                        # Static assets (Primary.svg logo, brand SVGs)
└── src/
    ├── middleware.ts              # Auth gate: token cookie → redirect /login or /admin
    │
    ├── app/                       # Next.js App Router
    │   ├── layout.tsx             # Root layout: fonts + <QueryProvider>
    │   ├── page.tsx               # "/" → redirect('/login')
    │   ├── globals.css            # Theme tokens (--gold, --card, --status-* …)
    │   ├── login/page.tsx         # Login screen (client)
    │   ├── admin/                 # All authenticated admin screens
    │   │   ├── layout.tsx         # Sidebar shell (SidebarProvider + AppSidebar)
    │   │   ├── page.tsx           # Overview dashboard
    │   │   ├── users/             # User mgmt + nested profile/approval routes
    │   │   │   ├── page.tsx
    │   │   │   ├── artist/[id]/page.tsx          # Approved artist inspection
    │   │   │   ├── artistapproval/[id]/page.tsx  # Pending artist approval
    │   │   │   ├── venue/[id]/page.tsx           # Approved venue inspection
    │   │   │   └── venueapproval/[id]/page.tsx   # Pending venue approval
    │   │   ├── moderation/page.tsx
    │   │   ├── messages/page.tsx
    │   │   ├── resources/         # page.tsx + SortableRow.tsx
    │   │   └── log/page.tsx
    │   └── api/                   # Route Handlers (BFF proxy layer)
    │       ├── auth/{login,logout,me}/route.ts
    │       └── admin/{overview,users,moderation,messages,resources,logs,
    │                  artist,artist/[id],venue,venue/[id]}/route.ts
    │
    ├── components/
    │   ├── ui/                    # shadcn primitives (button, table, dialog, sidebar, …)
    │   └── admin/                 # Feature components
    │       ├── layout/SideBar.tsx
    │       ├── overview/GrowthChart.tsx
    │       ├── users/UserManagementTable.tsx
    │       ├── moderation/{ModerationQueueTable,ModerationPreviewDialog}.tsx
    │       ├── messages/MessageThread.tsx
    │       └── resources/{CreateResourceDialog,ViewResourceDialog}.tsx
    │
    ├── features/
    │   └── auth/                  # api.ts, hooks.ts (useMe/useLogin/useLogout), AuthProvider.tsx
    │
    ├── hooks/
    │   ├── use-mobile.ts          # 768px breakpoint hook (sidebar)
    │   └── queries/              # One React Query hook per feature (useAdmin*, useResources, …)
    │
    ├── lib/
    │   ├── utils.ts               # cn()
    │   ├── providers/QueryProvider.tsx
    │   ├── schemas/{loginSchema,resourceSchema}.ts   # Zod
    │   └── api/
    │       ├── client.ts          # api() — browser → external backend, 401 refresh
    │       ├── auth.ts             # refresh() token rotation
    │       ├── media.ts            # uploadMedia() multipart → /media/upload
    │       ├── server/backendFetch.ts   # Server-side fetch w/ cookie token
    │       └── admin/             # Typed call wrappers (artists, venues, users, …)
    │
    ├── types/                     # authuser, user, resource, conversation, logs
    ├── utils/AdminRoutes.ts       # Role/status → URL routing helper
    └── data_mock/                 # Mock data (artists, venues, users, conversations, …)
```

---

## 4. Routing

Next.js App Router. Auth is enforced by [src/middleware.ts](src/middleware.ts), `matcher: ['/admin/:path*', '/login']`:
- No `token` cookie + not on `/login` → redirect to `/login`.
- Has `token` + on `/login` → redirect to `/admin`.

| URL path | File | Renders |
|---|---|---|
| `/` | [src/app/page.tsx](src/app/page.tsx) | Server redirect → `/login` |
| `/login` | [src/app/login/page.tsx](src/app/login/page.tsx) | Login form (email/password, Zod-validated) |
| `/admin` | [src/app/admin/page.tsx](src/app/admin/page.tsx) | Overview: 4 stat cards + `<GrowthChart>` |
| `/admin/users` | [src/app/admin/users/page.tsx](src/app/admin/users/page.tsx) | Header + `<UserManagementTable>` |
| `/admin/users/artist/[id]` | [.../artist/[id]/page.tsx](src/app/admin/users/artist/[id]/page.tsx) | Approved **artist inspection** (read-only profile + Suspend/Reset) |
| `/admin/users/artistapproval/[id]` | [.../artistapproval/[id]/page.tsx](src/app/admin/users/artistapproval/[id]/page.tsx) | **Artist approval** (profile + Approve/Decline/Request Changes + feedback) |
| `/admin/users/venue/[id]` | [.../venue/[id]/page.tsx](src/app/admin/users/venue/[id]/page.tsx) | Approved **venue inspection** (read-only + Suspend/Reset buttons*) |
| `/admin/users/venueapproval/[id]` | [.../venueapproval/[id]/page.tsx](src/app/admin/users/venueapproval/[id]/page.tsx) | **Venue approval** (profile + Approve/Decline + feedback) |
| `/admin/moderation` | [src/app/admin/moderation/page.tsx](src/app/admin/moderation/page.tsx) | Content moderation queue + preview dialog |
| `/admin/messages` | [src/app/admin/messages/page.tsx](src/app/admin/messages/page.tsx) | Conversation list (left) + thread viewer (right) |
| `/admin/resources` | [src/app/admin/resources/page.tsx](src/app/admin/resources/page.tsx) | Create dialog + drag-sortable resource table |
| `/admin/log` | [src/app/admin/log/page.tsx](src/app/admin/log/page.tsx) | Activity log table (expandable diff rows) |

The destination of a user row is computed by [getAdminUserRoute()](src/utils/AdminRoutes.ts): `role` (`venue`/`artist`) × `status` (`not-approved` → `*approval`, else → inspection). `getAdminLogRoute()` always returns `/admin/log` regardless of role.

### Route Handlers (server endpoints under `/api`)
These are Next.js handlers the browser can call; most proxy to the external backend via `backendFetch`.

| Handler route | Methods | Proxies to backend |
|---|---|---|
| `/api/auth/login` | POST | `POST {BACKEND}/auth/email/login` |
| `/api/auth/logout` | POST | none — clears `token` cookie locally |
| `/api/auth/me` | GET | none — **returns a hard-coded admin user** if a token cookie exists |
| `/api/admin/overview` | GET | `GET /admin/overview` |
| `/api/admin/users` | GET | `GET /users?page&limit` |
| `/api/admin/moderation` | GET, POST | `GET /admin/moderation`; POST → approve/reject endpoints |
| `/api/admin/messages` | GET | `GET /admin/conversations?artistId&venueId` |
| `/api/admin/resources` | GET, PUT | `GET`/`PUT /admin/resources` |
| `/api/admin/logs` | GET | `GET /admin/logs?userId` |
| `/api/admin/artist/[id]` | GET | resolves userId → `artistProfileId` via `/admin/user/[id]/profiles`, then `GET /admin/artist/profile/[profileId]` |
| `/api/admin/venue/[id]` | GET | same pattern → `/admin/venue/profile/[profileId]` |
| `/api/admin/artist` | GET | **mock** — returns `data_mock/artists` |
| `/api/admin/venue` | GET | **mock** — returns `data_mock/venues` |

> ⚠️ **Important architectural inconsistency:** The browser-side `api()` client hits `NEXT_PUBLIC_API_URL` (the external backend) **directly** for most calls — it does **not** route through these `/api/admin/*` handlers. So several of the Route Handlers above (overview, users, logs, messages, moderation, the `/api/admin/artist|venue/[id]` resolvers) appear to be an alternate/legacy BFF path that the current hooks bypass. The hooks in `lib/api/admin/*` call paths like `/admin/overview`, `/admin/users`, `/admin/artist/{id}` straight on the backend base URL.

---

## 5. API Client Layer

There are **three** ways data leaves the browser, plus a server-side fetcher.

### 5a. `api()` — primary browser client — [src/lib/api/client.ts](src/lib/api/client.ts)
- Base URL: `process.env.NEXT_PUBLIC_API_URL`.
- Reads `token` from `document.cookie`, sets `Authorization: Bearer <token>` + `Content-Type: application/json`.
- On **401**: calls `refresh()`, rewrites the `token` cookie, retries once. On failure throws `Session expired`.
- On non-OK: throws parsed JSON error (or text).
- Returns `res.json()`.
- (Note: a module-level `isRefreshing`/`queue` exist but are unused — no real request queueing.)

### 5b. `refresh()` — [src/lib/api/auth.ts](src/lib/api/auth.ts)
- `POST {NEXT_PUBLIC_API_URL}/auth/refresh` with `Authorization: Bearer <refreshToken-from-cookie>`.
- Writes new `token` + `refreshToken` cookies. Returns `{ token, refreshToken, tokenExpires }`.

### 5c. `uploadMedia()` — [src/lib/api/media.ts](src/lib/api/media.ts)
- `POST {NEXT_PUBLIC_API_URL}/media/upload` as `FormData` (no JSON content-type — deliberately separate from `api()`).
- Returns `{ id, storageKey, mimeType, originalFilename }`.

### 5d. `backendFetch()` — server-only — [src/lib/api/server/backendFetch.ts](src/lib/api/server/backendFetch.ts)
- Base URL: `BACKEND_API_URL` (default `http://localhost:3001/v1`).
- Reads `token` from `next/headers` cookies, forwards as Bearer. Used exclusively inside Route Handlers.

### Typed call wrappers — every endpoint

**Auth — [src/features/auth/api.ts](src/features/auth/api.ts)**
| Function | Method | Endpoint | Payload | Returns |
|---|---|---|---|---|
| `authApi.login` | POST | `/auth/email/login` | `{ email, password }` | `{ token, refreshToken, ... }` |
| `authApi.me` | GET | `/auth/me` | — | `{ user: { id, name, email, role } \| null }` (maps backend `role.name`, defaults `admin`) |
| `authApi.logout` | POST | `/auth/logout` | — | — |

**Overview — [src/lib/api/admin/overview.ts](src/lib/api/admin/overview.ts)**
| `fetchAdminOverview` | GET | `/admin/overview` | — | `{ totArtists, totVenues, totPendingArtist, totPendingVenue }` |

**Users — [src/lib/api/admin/users.ts](src/lib/api/admin/users.ts)**
| Function | Method | Endpoint | Payload |
|---|---|---|---|
| `fetchAdminUsers(page, role?)` | GET | `/admin/users?page=&limit=50[&role=]` | — (returns `{ data: UserBe[], hasNextPage }`) |
| `suspendUser(id)` | POST | `/admin/user/suspend` | `{ id }` |
| `unsuspendUser(id)` | POST | `/admin/user/unsuspend` | `{ id }` |

**Artists — [src/lib/api/admin/artists.ts](src/lib/api/admin/artists.ts)**
| Function | Method | Endpoint | Payload |
|---|---|---|---|
| `fetchAdminArtist(id)` | GET | `/admin/artist/{id}` | — |
| `approveArtist(id)` | POST | `/admin/user/approve` | `{ id }` |
| `rejectArtist(id, feedback)` | POST | `/admin/user/reject` | `{ id, feedback }` |
| `requestArtistChanges(id, feedback)` | POST | `/admin/user/req-changes` | `{ id, feedback }` |
| `suspendArtist(id)` | POST | `/admin/user/suspend` | `{ id }` |

**Venues — [src/lib/api/admin/venues.ts](src/lib/api/admin/venues.ts)**
| Function | Method | Endpoint | Payload |
|---|---|---|---|
| `fetchAdminVenue(id)` | GET | `/admin/venue/{id}` | — |
| `approveVenue(id)` | POST | `/admin/venue/approve` | `{ id }` |
| `rejectVenue(id, feedback)` | POST | `/admin/venue/reject` | `{ id, feedback }` |

**Moderation — [src/lib/api/admin/moderation.ts](src/lib/api/admin/moderation.ts)**
| Function | Method | Endpoint | Payload |
|---|---|---|---|
| `fetchModerationQueue()` | GET | `/admin/moderation` | — |
| `approveModeration(contentModId)` | POST | `/admin/moderation/approve` | `{ contentModId }` |
| `rejectModeration(contentModId)` | POST | `/admin/moderation/reject` | `{ contentModId }` |

**Conversations / Messages**
| Function | File | Method | Endpoint |
|---|---|---|---|
| `fetchAdminConversations({id?,artistId?,venueId?})` | [messages.ts](src/lib/api/admin/messages.ts) | GET | `/admin/conversations?…` |
| `fetchConversationThread(id)` | [conversations.ts](src/lib/api/admin/conversations.ts) | GET | `/admin/conversations/{id}` → `{ conversationId, messages[] }` |

**Resources — [src/lib/api/admin/resources.ts](src/lib/api/admin/resources.ts)**
| Function | Method | Endpoint | Payload |
|---|---|---|---|
| `fetchResources()` | GET | `/admin/resources` | → `Resource[]` |
| `updateResources(items)` | PUT | `/admin/resources` | `{ items: ResourceItemInput[] }` (bulk replace) → `{ message }` |

**Logs — [src/lib/api/admin/logs.ts](src/lib/api/admin/logs.ts)**
| `fetchAdminLogs(userId?)` | GET | `/admin/logs[?userId=]` | → `ActivityLog[]` |

**Files — [src/lib/api/admin/uploadfiles.ts](src/lib/api/admin/uploadfiles.ts)**
| `uploadFile(file)` | POST | `/files/upload` (FormData) | → `{ file: { id, path } }` *(note: built on `api()`, which would force a JSON content-type — `uploadMedia` is the FormData-safe path actually used by resource dialogs)* |

---

## 6. Auth Flow

**Login** ([login/page.tsx](src/app/login/page.tsx)):
1. Form validated by `loginSchema` (email + min-6 password).
2. `useLogin()` → `authApi.login()` → `POST /auth/email/login` (directly on backend via `api()`).
3. On success, the page **manually writes cookies in JS**: `token=<res.token>` and `refreshToken=<res.refreshToken>` (`path=/`, **not** `httpOnly`, **not** `Secure`).
4. Invalidates the `['me']` query, then `router.push('/admin')`.

**Token storage & transmission:**
- Stored as **plain browser cookies** (readable by JS — `document.cookie`). `api()`, `refresh()`, and `uploadMedia()` all parse the `token` cookie and attach `Authorization: Bearer`.
- Server-side `backendFetch()` reads the same `token` cookie from request headers.

**Session / identity:**
- `AuthProvider` ([features/auth/AuthProvider.tsx](src/features/auth/AuthProvider.tsx)) exposes `{ user, isLoading, isAuthenticated }` via `useMe()`. *(Note: `AuthProvider` is defined but is **not** mounted in the root layout — only `QueryProvider` is. `useAuth()` is therefore currently unused by the rendered tree.)*
- `useMe()` → `authApi.me()` → `GET /auth/me`, mapping `role.name` (default `admin`).
- There is a **second, divergent** `me` implementation at [/api/auth/me/route.ts](src/app/api/auth/me/route.ts) that returns a hard-coded `{ id: 'usr_1', name: 'Admin', role: 'admin' }` whenever a token cookie is present — but the client `authApi.me()` does not call it (it calls the backend directly).

**Token refresh:** `api()` intercepts 401, calls `refresh()` (`POST /auth/refresh` with the refresh-token cookie), rotates cookies, retries once.

**Route protection:** Enforced at the edge by [middleware.ts](src/middleware.ts) on `/admin/:path*` and `/login` — presence of the `token` cookie is the only gate. There is no server-side role check in middleware; role is assumed `admin`.

**Logout** ([SideBar.tsx](src/components/admin/layout/SideBar.tsx)): `useLogout()` → `POST /auth/logout`, then clears `token`/`refreshToken` cookies (`Max-Age=0`), removes `['me']` from the query cache, and routes to `/login`. Falls back to local logout even if the API call fails.

---

## 7. Admin Features Implemented

### Overview dashboard
- **Page:** [admin/page.tsx](src/app/admin/page.tsx) · **API:** `useAdminOverview()` → `GET /admin/overview`.
- **UI:** Four stat cards — Artists, Venues, Pending Artist Approvals, Pending Venue Approvals — with loading `...` placeholders and `toLocaleString()` formatting. Below: `<GrowthChart>`.
- ⚠️ **GrowthChart is mock-only** ([GrowthChart.tsx](src/components/admin/overview/GrowthChart.tsx)) — its 14d/30d/1y data is hard-coded in `dataMap`; toggles for Artists/Venues series and range are local state. No API.

### User management (list + bulk actions)
- **Page:** [admin/users/page.tsx](src/app/admin/users/page.tsx) → [UserManagementTable](src/components/admin/users/UserManagementTable.tsx).
- **API:** `useAdminUsers(page, roleFilter)` → `GET /admin/users?page&limit=50&role=`. Actions: `suspendUser`, `unsuspendUser`, `approveArtist`/`approveVenue`.
- **UI:** Role toggle (Artists/Venues — sent to backend, resets to page 1), search-by (name/email/joined/lastlogin — client-side), status filter (client-side), and a table. Rows map via `mapUserToBe` (see §7 status logic). Status-dependent inline actions (`renderActions`): `Not-approved`→Approve+Review; `Active`→Suspend+Ban(→review route); `Inactive`/`Banned`→View; `Suspended`→Unsuspend. Row click → `getAdminUserRoute(user)`. Trailing `⋮` button → `getAdminLogRoute` (`/admin/log`). Mutations invalidate `['admin-users']`.

### Artist approval
- **Page:** [artistapproval/[id]/page.tsx](src/app/admin/users/artistapproval/[id]/page.tsx) · **API:** `useAdminArtist(id)` → `GET /admin/artist/{id}`; `approveArtist`/`rejectArtist`/`requestArtistChanges`.
- **UI:** Two-column profile (Basic Info, Members, Instruments, Genres & Style, Media w/ YouTube embed + live-performance links + socials, Music Links, Booking, Live Setup, Past Gigs, Photos grid) + right rail **Approval Decision** panel: feedback textarea, "Request Changes" (requires feedback), and Approve / Decline (Decline requires feedback). Each action routes back to `/admin/users` on success; errors shown inline. Preview button is disabled (public profile only after approval).

### Artist inspection (approved)
- **Page:** [artist/[id]/page.tsx](src/app/admin/users/artist/[id]/page.tsx) · **API:** `useAdminArtist(id)`; `suspendArtist`.
- **UI:** Same profile layout (read-only). Handles `!artist.hasProfile` with a "No Profile Set Up" state. Right rail "Admin Actions": **Suspend** (calls `suspendArtist`, routes to `/admin/users`) and **Reset Password** (no handler wired). "Show Preview" opens `{NEXT_PUBLIC_PLATFORM_URL}/artists/{slug}` only when `approvalStatus === 'APPROVED'`.

### Venue approval
- **Page:** [venueapproval/[id]/page.tsx](src/app/admin/users/venueapproval/[id]/page.tsx) · **API:** `useAdminVenue(id)` → `GET /admin/venue/{id}`; `approveVenue`/`rejectVenue`.
- **UI:** Venue Details, Capacity & Stage, Equipment & Support, Venue History, Booking Preferences, Photos + right-rail Approve / Decline (Decline requires feedback). No "Request Changes" for venues (no such API exists).

### Venue inspection (approved)
- **Page:** [venue/[id]/page.tsx](src/app/admin/users/venue/[id]/page.tsx) · **API:** `useAdminVenue(id)`.
- **UI:** Same read-only profile + Quick Summary card. ⚠️ The **Suspend Venue** and **Reset Password** buttons here have **no onClick handlers** (decorative). "Show Preview" gated on `data.marketplaceUnlocked` + `slug` → `{PLATFORM_URL}/venues/{slug}`.

### Content moderation queue
- **Page:** [admin/moderation/page.tsx](src/app/admin/moderation/page.tsx) → [ModerationQueueTable](src/components/admin/moderation/ModerationQueueTable.tsx) + [ModerationPreviewDialog](src/components/admin/moderation/ModerationPreviewDialog.tsx).
- **API:** `useModerationQueue()` → `GET /admin/moderation`; `useModerationActions()` → approve/reject (invalidate `['moderation-queue']`).
- **UI:** Role toggle (Artists/Venues) + type filter (all/images/video) — both client-side; table of `userId / name / type / date / actions`. Approve/Reject inline (stopPropagation), row click opens preview dialog. Dialog renders content by `type` (images grid, video iframe, social/music link lists, fallback text) with Approve/Reject in the footer. ⚠️ The dialog expects `item.content`, but the page's `tableData` mapping does **not** include `content`, so previews show empty content currently. A "View Profile" button links to a hard-coded Figma URL.

### Message moderation (conversations view)
- **Page:** [admin/messages/page.tsx](src/app/admin/messages/page.tsx) → [MessageThread](src/components/admin/messages/MessageThread.tsx).
- **API:** `useAdminMessages()` → `GET /admin/conversations`; `useConversationThread(id)` → `GET /admin/conversations/{id}`.
- **UI:** Left list of conversations (search + all/artist/venue filter, sorted by `lastMessageAt`) — artist/venue names are currently placeholders (the IDs). Selecting one loads the thread; right pane renders messages aligned by sender (artist right / venue left / admin), with attachment rendering by type (image/video/audio/pdf/document). Read-only — no reply capability.

### Resources management
- **Page:** [admin/resources/page.tsx](src/app/admin/resources/page.tsx), [SortableRow.tsx](src/app/admin/resources/SortableRow.tsx) + [CreateResourceDialog](src/components/admin/resources/CreateResourceDialog.tsx) / [ViewResourceDialog](src/components/admin/resources/ViewResourceDialog.tsx).
- **API:** `useResources()` → `GET /admin/resources`; `useUpdateResources()` → `PUT /admin/resources` (bulk replace of the whole ordered list); `uploadMedia()` for PDFs/thumbnails.
- **UI:** dnd-kit drag-to-reorder table; each reorder/delete rebuilds the full `items` array and `PUT`s it (optimistic local state synced from query via effect). Create/Edit dialogs are Zod-validated discriminated unions by `type` (youtube/website/pdf); YouTube derives an embed preview; PDF/website allow optional thumbnail upload. Delete uses `window.confirm`. **Create/Edit semantics:** there is no dedicated create/update/delete endpoint — every mutation re-sends the entire list to `PUT /admin/resources`.

### User suspend / unsuspend / approve / ban
- Implemented inline in [UserManagementTable](src/components/admin/users/UserManagementTable.tsx) (`/admin/user/suspend`, `/admin/user/unsuspend`, plus approve via artist/venue endpoints). "Ban" buttons currently route to the review/inspection page rather than calling a ban endpoint (no ban API exists in the client layer). "Unlock" — **no dedicated unlock feature/endpoint exists** in the codebase; account `LOCKED` state is mapped to `Suspended` in `mapUserToBe` and handled via unsuspend.

### Activity logs
- **Page:** [admin/log/page.tsx](src/app/admin/log/page.tsx) · **API:** `useAdminLogs()` → `GET /admin/logs`.
- **UI:** Header card with a **hard-coded** user (`Aria Stone / usr_1001`), then a table of Date&Time / Event / Change with expandable `<details>` rows showing added/removed/before→after diffs (`changeFrom`/`changeTo`). Imports `activityLogsMock` but renders from the query. `useAdminLogs` is typed `ActivityLog[]` but doesn't pass a `userId`.

---

## 8. Component Breakdown

### Feature components (`src/components/admin/`)
| Component | Renders | Props |
|---|---|---|
| `AppSidebar` ([layout/SideBar.tsx](src/components/admin/layout/SideBar.tsx)) | Collapsible sidebar: logo, 5 nav items (Overview, User Management, Content Moderation, Message Moderation, Help Resources), logout footer. Active state via `usePathname`. | none |
| `GrowthChart` ([overview/GrowthChart.tsx](src/components/admin/overview/GrowthChart.tsx)) | Recharts area chart with Artists/Venues toggles + 14d/30d/1y range (mock data). | none |
| `UserManagementTable` ([users/UserManagementTable.tsx](src/components/admin/users/UserManagementTable.tsx)) | Search/filter bar, role toggle, user table, status-aware row actions, pagination. | none (self-contained) |
| `ModerationQueueTable` ([moderation/ModerationQueueTable.tsx](src/components/admin/moderation/ModerationQueueTable.tsx)) | Role/type filters + moderation rows w/ approve/reject. | `data, onApprove(id), onReject(id), onRowClick(item)` |
| `ModerationPreviewDialog` ([moderation/ModerationPreviewDialog.tsx](src/components/admin/moderation/ModerationPreviewDialog.tsx)) | Modal preview of content by type + approve/reject. | `open, onOpenChange, item, onApprove(id), onReject(id)` |
| `MessageThread` ([messages/MessageThread.tsx](src/components/admin/messages/MessageThread.tsx)) | Conversation header (avatars) + message bubbles + attachments. | `conversation: any` |
| `CreateResourceDialog` ([resources/CreateResourceDialog.tsx](src/components/admin/resources/CreateResourceDialog.tsx)) | Create-resource modal form (type/title/category/description/url/pdf/thumbnail). | `onSuccess?()` |
| `ViewResourceDialog` ([resources/ViewResourceDialog.tsx](src/components/admin/resources/ViewResourceDialog.tsx)) | Edit form + live preview pane. | `open, onOpenChange, resource, onSuccess?()` |
| `SortableRow` ([resources/SortableRow.tsx](src/app/admin/resources/SortableRow.tsx)) | One draggable resource row (grip, type label, title/desc, View/Delete). | `item, onView(item), onDelete(item)` |

### UI primitives (`src/components/ui/`, shadcn/Radix)
`avatar, badge, button, card, chart, dialog, dropdown-menu, input, label, radio-group, scroll-area, select, separator, sheet, sidebar, skeleton, table, tabs, textarea, tooltip` — standard shadcn components styled via the theme tokens in `globals.css` and `cn()`.

---

## 9. State Management

- **Server state:** **TanStack React Query** is the single source of truth for all remote data. Configured in [QueryProvider](src/lib/providers/QueryProvider.tsx): `staleTime` 2 min, `retry: 1`, `refetchOnWindowFocus: false`, devtools mounted. Query keys: `['me']`, `['admin-overview']`, `['admin-users', page, role]`, `['admin-artist', id]`, `['admin-venue', id]`, `['moderation-queue']`, `['admin-conversations', filters]`, `['conversation-thread', id]`, `['resources']`, `['admin-logs']`.
  - ⚠️ Cache-key mismatch: `useUpdateResources` in [useResources.ts](src/hooks/queries/useResources.ts) invalidates `['admin-resources']` (`onSettled`) which **no query uses**; the standalone [useUpdateResources.ts](src/hooks/queries/useUpdateResources.ts) correctly invalidates `['resources']`.
- **Auth context:** `AuthContext`/`useAuth` exist ([AuthProvider.tsx](src/features/auth/AuthProvider.tsx)) but the provider is **not mounted**, so auth identity in practice flows through `useMe()`/cookies, not context.
- **Local UI state:** plain `useState` per page (selected conversation, dialog open/close, filters, pagination page, busy flags, drag order). No Redux/Zustand/Jotai.
- **Auth tokens:** persisted in **browser cookies** (not React state), read directly where needed.

---

## 10. Data Tables & Pagination

- **Users table:** Server-driven pagination via `useAdminUsers(currentPage, roleFilter)` → `?page=&limit=50&role=`. The backend returns `{ data, hasNextPage }`. `totalPages = hasNextPage ? currentPage+1 : currentPage` (so page buttons grow one-at-a-time; there is no known total count). **Role filtering is server-side** (so pagination stays correct); **search and status filtering are client-side** over the current page only. Status badges/labels come from `mapUserToBe` ([types/user.ts](src/types/user.ts)), which collapses backend `accountStatus` + `profileApprovalStatus` into `Active / Not-approved / Inactive / Suspended / Banned` with account-level states taking precedence.
- **Moderation table:** No server pagination — full queue fetched once; role + type filters applied client-side.
- **Resources table:** No pagination; full ordered list, drag-reordered locally and persisted by re-`PUT`ting the entire array (`index` field drives order). Local `items` state is synced from the query via an effect that guards against re-render loops.
- **Messages list:** No pagination; client-side search + sort by `lastMessageAt`.
- **Logs table:** No pagination; renders the full `ActivityLog[]` with expandable diff rows.

---

## 11. Feature Development Flow — adding a new admin screen

Follow the established pattern (using the existing features as templates). To add, e.g., a "Reports" screen:

1. **Types** — add a type in `src/types/` (e.g. `report.ts`) for the backend shape and any UI mapping (mirror `types/user.ts`'s `mapUserToBe` if backend↔UI differ).

2. **API wrapper** — add `src/lib/api/admin/reports.ts` exporting functions built on `api()`:
   ```ts
   import { api } from '@/lib/api/client'
   export const fetchReports = (page: number) => api(`/admin/reports?page=${page}`)
   export const resolveReport = (id: string) => api('/admin/report/resolve', { method: 'POST', body: JSON.stringify({ id }) })
   ```
   (If the call must go through the server/BFF instead, add a Route Handler under `src/app/api/admin/reports/route.ts` using `backendFetch`, and point the wrapper at `/api/admin/reports`.)

3. **Query hook** — add `src/hooks/queries/useReports.ts` with `useQuery`/`useMutation`, a stable query key (`['reports', page]`), and `invalidateQueries` on mutation success (see `useModerationActions`).

4. **Route/page** — create `src/app/admin/reports/page.tsx` (`'use client'`), using the standard header markup (uppercase eyebrow `<p>` + display-font `<h1>`) and rendering a feature component. For detail pages use a dynamic segment `src/app/admin/reports/[id]/page.tsx` and read params with React 19 `use(params)`.

5. **Feature components** — put presentational pieces in `src/components/admin/reports/` (table, dialog). Reuse `src/components/ui/*` primitives and the `var(--…)` theme tokens; use `lucide-react` for icons. Add dialogs with the shadcn `Dialog` and React Hook Form + Zod (`src/lib/schemas/`) for any forms.

6. **Navigation** — add an entry to the `navMain` array in [SideBar.tsx](src/components/admin/layout/SideBar.tsx) (`{ title, url, icon }`). If the screen is reached from a user row, extend [AdminRoutes.ts](src/utils/AdminRoutes.ts).

7. **Auth/access** — anything under `/admin/*` is automatically gated by [middleware.ts](src/middleware.ts); no extra wiring needed beyond ensuring the `token` cookie reaches the backend (handled by `api()`/`backendFetch`).

8. **Validate** — `npm run lint` (pre-commit also runs prettier + eslint via husky/lint-staged). Follow the [AGENTS.md](AGENTS.md) instruction to consult `node_modules/next/dist/docs/` before using unfamiliar Next.js APIs, since this Next.js version is treated as non-standard.

---

### Appendix — Known inconsistencies / tech debt surfaced during analysis
- Two parallel data paths (direct `api()` vs `/api/admin/*` Route Handlers); most hooks bypass the handlers, leaving several handlers (and the `data_mock`-backed `/api/admin/artist|venue`) effectively dead or legacy.
- `AuthProvider` is implemented but never mounted; `/api/auth/me` returns a hard-coded admin and is unused by the client.
- Tokens are stored in JS-readable, non-`Secure`/non-`httpOnly` cookies.
- Moderation preview dialog reads `item.content`, which the page mapping omits.
- Resource update cache invalidation key (`['admin-resources']`) doesn't match the query key (`['resources']`) in one of the two `useUpdateResources` hooks.
- Venue inspection Suspend/Reset buttons and artist Reset-Password button are unwired.
- Logs page shows a hard-coded user header and doesn't scope the request by `userId`.
- GrowthChart is entirely mock data.
