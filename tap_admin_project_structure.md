# TAP Admin — Project Structure Analysis

> Generated: 2026-06-03

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
│   │   ├── layout.tsx           # Root layout (fonts, QueryProvider)
│   │   ├── page.tsx             # Root page → redirects to /login
│   │   ├── globals.css          # Global CSS / design tokens
│   │   ├── favicon.ico
│   │   ├── login/
│   │   │   └── page.tsx         # Login screen (mock only)
│   │   ├── admin/
│   │   │   ├── layout.tsx       # Admin shell (SidebarProvider + AppSidebar)
│   │   │   ├── page.tsx         # /admin — Overview / dashboard
│   │   │   ├── log/
│   │   │   │   └── page.tsx     # /admin/log — Activity log viewer
│   │   │   ├── messages/
│   │   │   │   └── page.tsx     # /admin/messages — Message moderation
│   │   │   ├── moderation/
│   │   │   │   └── page.tsx     # /admin/moderation — Content moderation queue
│   │   │   ├── resources/
│   │   │   │   ├── page.tsx     # /admin/resources — Help resource management
│   │   │   │   └── SortableRow.tsx
│   │   │   └── users/
│   │   │       ├── page.tsx     # /admin/users — User management table
│   │   │       ├── artist/
│   │   │       │   ├── page.tsx          # /admin/users/artist — (unused, artist list)
│   │   │       │   └── [id]/page.tsx     # /admin/users/artist/[id] — Artist detail/inspection
│   │   │       ├── artistapproval/
│   │   │       │   ├── page.tsx          # /admin/users/artistapproval — (list)
│   │   │       │   └── [id]/page.tsx     # /admin/users/artistapproval/[id] — Artist approval screen
│   │   │       ├── venue/
│   │   │       │   ├── page.tsx          # /admin/users/venue — (unused, venue list)
│   │   │       │   └── [id]/page.tsx     # /admin/users/venue/[id] — Venue detail/inspection
│   │   │       └── venueapproval/
│   │   │           ├── page.tsx          # /admin/users/venueapproval — (list)
│   │   │           └── [id]/page.tsx     # /admin/users/venueapproval/[id] — Venue approval screen
│   │   └── api/
│   │       └── admin/
│   │           ├── artist/
│   │           │   ├── route.ts          # GET /api/admin/artist
│   │           │   └── [id]/route.ts     # GET /api/admin/artist/[id]
│   │           ├── venue/
│   │           │   ├── route.ts          # GET /api/admin/venue
│   │           │   └── [id]/route.ts     # GET /api/admin/venue/[id]
│   │           ├── users/route.ts        # GET /api/admin/users
│   │           ├── logs/route.ts         # GET /api/admin/logs
│   │           ├── messages/route.ts     # GET /api/admin/messages
│   │           ├── moderation/route.ts   # GET /api/admin/moderation
│   │           └── resources/route.ts    # GET /api/admin/resources
│   ├── components/
│   │   ├── admin/
│   │   │   ├── layout/SideBar.tsx
│   │   │   ├── messages/MessageThread.tsx
│   │   │   ├── moderation/
│   │   │   │   ├── ModerationPreviewDialog.tsx
│   │   │   │   └── ModerationQueueTable.tsx
│   │   │   ├── overview/GrowthChart.tsx
│   │   │   ├── resources/
│   │   │   │   ├── CreateResourceDialog.tsx
│   │   │   │   └── ViewResourceDialog.tsx
│   │   │   └── users/UserManagementTable.tsx
│   │   └── ui/                  # shadcn/ui primitives
│   │       ├── avatar, badge, button, card, chart, dialog
│   │       ├── dropdown-menu, input, label, radio-group
│   │       ├── scroll-area, select, separator, sheet
│   │       ├── sidebar, skeleton, table, tabs
│   │       ├── textarea, tooltip
│   ├── data_mock/               # ALL data is currently mock (in-memory)
│   │   ├── activityLogs.ts
│   │   ├── artists.ts
│   │   ├── conversations.ts
│   │   ├── moderation.ts
│   │   ├── resources.ts
│   │   ├── users.ts
│   │   └── venues.ts
│   ├── hooks/queries/           # TanStack Query hooks
│   │   ├── useAdminArtists.ts
│   │   ├── useAdminLogs.ts
│   │   ├── useAdminMessages.ts
│   │   ├── useAdminUsers.ts
│   │   ├── useAdminVenues.ts
│   │   ├── useModerationQueue.ts
│   │   └── useResources.ts
│   ├── lib/
│   │   ├── api/admin/           # Thin fetch wrappers (no base URL config)
│   │   │   ├── artists.ts
│   │   │   ├── logs.ts
│   │   │   ├── messages.ts
│   │   │   ├── moderation.ts
│   │   │   ├── resources.ts
│   │   │   ├── users.ts
│   │   │   └── venues.ts
│   │   ├── providers/
│   │   │   └── QueryProvider.tsx
│   │   └── utils.ts             # clsx/tailwind-merge helper
│   ├── types/
│   │   ├── conversation.ts
│   │   ├── logs.ts
│   │   ├── resource.ts
│   │   └── user.ts
│   └── utils/
│       └── AdminRoutes.ts       # Route helpers (artist/venue/approval routing logic)
├── components.json              # shadcn/ui config
├── next.config.ts               # Empty (default config)
├── tsconfig.json
├── eslint.config.mjs
├── .prettierrc
├── .husky/pre-commit            # lint-staged hook
├── Dockerfile
└── docker-compose.yml
```

---

## 2. Framework & Key Dependencies

| Category | Choice |
|---|---|
| **Framework** | Next.js 16.2.6 (App Router) |
| **React** | 19.2.4 |
| **Language** | TypeScript 5 |
| **UI Library** | shadcn/ui (components.json configured) built on Radix UI |
| **Styling** | Tailwind CSS v4 + `tw-animate-css` + CSS variables for design tokens |
| **State Management** | None — server state only via TanStack React Query v5 |
| **Data Fetching** | TanStack Query v5 (`@tanstack/react-query`) |
| **Charts** | Recharts v3 |
| **Icons** | Lucide React v1.14 |
| **Drag & Drop** | `@dnd-kit/core` + `@dnd-kit/sortable` (used on Resources page) |
| **Animation** | Framer Motion v12 |
| **Date Formatting** | date-fns v4 |
| **Toasts** | Sonner v2 |
| **Linting / Formatting** | ESLint 9 + Prettier 3 + Husky + lint-staged |
| **Containerisation** | Docker + docker-compose |

---

## 3. API Call Architecture

The project uses a 3-layer pattern: **page → React Query hook → fetch wrapper → Next.js API route → mock data**.

### Layer 1 — Fetch wrappers (`src/lib/api/admin/`)
Thin functions that call Next.js API routes using relative paths (no base URL, no axios, no shared client):

| File | Function | Calls |
|---|---|---|
| `artists.ts` | `fetchAdminArtist(id)` | `GET /api/admin/artist/:id` |
| `venues.ts` | `fetchAdminVenue(id)` | `GET /api/admin/venue/:id` |
| `users.ts` | `fetchAdminUsers()` | `GET /api/admin/users` |
| `logs.ts` | `fetchAdminLogs()` | `GET /api/admin/logs` |
| `messages.ts` | `fetchAdminMessages()` | `GET /api/admin/messages` |
| `moderation.ts` | `fetchModerationQueue()` | `GET /api/admin/moderation` |
| `resources.ts` | `fetchResources()` | `GET /api/admin/resources` |

> **Note:** There is no central API client, no base URL env var, no axios instance, no auth header injection. All calls use native `fetch` with relative URLs.

> **Note:** The API layer only has GET endpoints for `artist` and `venue` by ID. There is no `GET /api/admin/artist` (list) used by any hook — the user list uses a separate `users` endpoint. The `/api/admin/venue` list route exists but no hook calls it.

### Layer 2 — React Query hooks (`src/hooks/queries/`)
Each hook wraps a fetch function with `useQuery`. Default cache config: `staleTime: 2min`, `retry: 1`, `refetchOnWindowFocus: false`.

### Layer 3 — Next.js API routes (`src/app/api/admin/`)
Every route handler imports directly from `src/data_mock/` and returns `NextResponse.json(mockData)`. No database, no external HTTP calls, no auth checks.

---

## 4. Authentication & Session Management

**Current state: NONE — completely mocked.**

- The login page (`src/app/login/page.tsx`) has email/password inputs but the `handleLogin` function just calls `router.push("/admin")` with a `// TEMP MOCK LOGIN` comment.
- The sidebar logout button calls `router.push("/login")` with a `// TEMP MOCK LOGOUT` comment.
- There is **no middleware**, no session token, no cookie, no JWT, no context, no auth state whatsoever.
- Any user can navigate directly to `/admin` without logging in.

**What needs to be built:**
- Auth middleware (`src/middleware.ts`) to protect `/admin/*` routes
- Session/token storage (cookie recommended for SSR compatibility)
- Real login API endpoint with credential validation

---

## 5. Routing Structure

All routing uses Next.js App Router file-based routing.

| URL | Page File | Screen Description |
|---|---|---|
| `/` | `src/app/page.tsx` | Redirects to `/login` |
| `/login` | `src/app/login/page.tsx` | Login form (mock, no real auth) |
| `/admin` | `src/app/admin/page.tsx` | Overview dashboard — stats cards + growth chart |
| `/admin/users` | `src/app/admin/users/page.tsx` | User management table (all users: artists + venues) |
| `/admin/users/artist/[id]` | `src/app/admin/users/artist/[id]/page.tsx` | Artist profile inspection (active artist detail view) |
| `/admin/users/artistapproval/[id]` | `src/app/admin/users/artistapproval/[id]/page.tsx` | Artist approval screen (approve / request changes / reject) |
| `/admin/users/venue/[id]` | `src/app/admin/users/venue/[id]/page.tsx` | Venue profile inspection |
| `/admin/users/venueapproval/[id]` | `src/app/admin/users/venueapproval/[id]/page.tsx` | Venue approval screen |
| `/admin/moderation` | `src/app/admin/moderation/page.tsx` | Content moderation queue (images/videos awaiting review) |
| `/admin/messages` | `src/app/admin/messages/page.tsx` | Message moderation — read-only view of artist↔venue conversations |
| `/admin/log` | `src/app/admin/log/page.tsx` | Activity log viewer (currently hardcoded to user "Aria Stone") |
| `/admin/resources` | `src/app/admin/resources/page.tsx` | Help resource management with drag-to-reorder |

**Route helper:** `src/utils/AdminRoutes.ts` — `getAdminUserRoute()` routes to the correct detail or approval page based on a user's `role` and `status`. Used by `UserManagementTable` to navigate on row click.

**Sidebar nav items:**
- Overview → `/admin`
- User Management → `/admin/users`
- Content Moderation → `/admin/moderation`
- Message Moderation → `/admin/messages`
- Help Resources → `/admin/resources`

---

## 6. Environment Variables

**No `.env`, `.env.local`, or `.env.example` file exists in the project.**

The `next.config.ts` is empty (default config, no `env` or `publicRuntimeConfig` entries). No `process.env.*` references appear anywhere in the source code.

**Implication:** When integrating a real backend, the following env vars will need to be added at minimum:
- `NEXT_PUBLIC_API_URL` or similar for the backend base URL
- `NEXTAUTH_SECRET` / `JWT_SECRET` for auth
- Any third-party service keys (storage, email, etc.)

---

## 7. Hardcoded Values & Backend-Readiness Issues

### Hardcoded external URLs
- `https://civic-sauna-76601524.figma.site/` — hardcoded in every artist/venue detail page as the "Show Preview" button target. This links to a Figma prototype, clearly a placeholder.

### All data is mock
Every Next.js API route returns data from `src/data_mock/`. The mock data includes:
- 2 artists (both named "Luna Reverie", IDs `"1"` and `"3"`)
- 2 venues (both named "The Glass Warehouse", IDs `"2"` and `"5"`)
- 5 users
- 8 moderation items
- 4 conversations
- 12 resources
- 16 activity log entries (all for user `usr_1001`)

### Missing list endpoints / hooks
- `fetchAdminArtists()` (list) is missing — `useAdminArtists` only fetches by ID
- `fetchAdminVenues()` (list) is missing — `useAdminVenues` only fetches by ID
- The artist/venue list pages (`/admin/users/artist/page.tsx`, `/admin/users/venue/page.tsx`) exist as files but were not inspected for content — they may be empty stubs

### Activity log is not user-contextual
The `/admin/log` page hardcodes `user = { name: "Aria Stone", id: "usr_1001" }` and loads all logs (which happen to all be for that user). There is no mechanism to navigate to a specific user's log.

### Admin actions are UI-only
Suspend, Ban, Reset Password, Approve, Reject, and Request Changes buttons in detail/approval pages have no `onClick` handlers wired to any API call — they are purely decorative at this stage.

### Resource reorder is local state only
The drag-to-reorder on the Resources page uses local `useState` — reordering is lost on page refresh and there is no PATCH/PUT endpoint to persist order.

---

## Summary

The project is a well-structured **UI prototype** built for a TAP (artist-venue booking) platform admin dashboard. The entire stack — framework, component library, query layer, routing — is properly scaffolded and production-ready in terms of architecture. However:

1. **No real backend integration exists** — everything is in-memory mock data served by Next.js API routes.
2. **Authentication is completely absent** — login is a visual stub.
3. **No environment config** — no `.env` files or env var usage anywhere.
4. **Admin actions are non-functional** — all moderation/approval/suspension buttons are UI-only.
5. **No base URL abstraction** — API calls use relative paths, which works for the current Next.js-internal mock setup but will need a wrapper when pointing to a real external backend.
