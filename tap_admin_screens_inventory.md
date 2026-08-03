# TAP Admin — Screens & Components Inventory

> Last verified: 2026-07-31, against the working tree. The admin talks to the
> real TAP backend directly from the browser — there is no BFF/proxy layer
> (see [tap_admin_project_structure.md](tap_admin_project_structure.md) §3).
> All data below is live unless a screen is explicitly called out as
> read-only or as still-local UI state.

---

## Table of Contents

1. [Login Page](#1-login-page)
2. [Admin Overview (Dashboard)](#2-admin-overview-dashboard)
3. [User Management](#3-user-management)
4. [Artist Detail / Inspection](#4-artist-detail--inspection)
5. [Artist Approval](#5-artist-approval)
6. [Venue Detail / Inspection](#6-venue-detail--inspection)
7. [Venue Approval](#7-venue-approval)
8. [Content Moderation Queue](#8-content-moderation-queue)
9. [Message Moderation](#9-message-moderation)
10. [Activity Log Viewer](#10-activity-log-viewer)
11. [Resource Management](#11-resource-management)
12. [Vendor Management (Marketplace)](#12-vendor-management-marketplace)
13. [Shared Layout — App Sidebar](#13-shared-layout--app-sidebar)

---

## 1. Login Page

**Files:** [src/app/login/page.tsx](src/app/login/page.tsx) (server wrapper,
sets `<title>`) → [src/app/login/LoginClient.tsx](src/app/login/LoginClient.tsx)
**Route:** `/login`

### UI
Centered card on a full-screen background. Contains:
- TAP logo (`/Primary.svg`)
- "TAP ADMIN" label + "Welcome Back" heading (Cormorant Garamond font)
- Email input, Password input (react-hook-form + zod, `loginSchema.ts`)
- Inline field errors
- "Sign In" button (gold background), shows "Signing in..." while pending

### User Actions
| Action | Behaviour |
|---|---|
| Submit form | `POST /auth/email/login` via `useLogin()`. Non-`admin` roles are rejected client-side with an error banner ("This account does not have admin access…") and never get a session. Admin logins call `setSession(...)`, invalidate the `['me']` query, then `router.push('/admin')`. |

### Data
Real API call. On success, response includes `token`, `refreshToken`,
`tokenExpires`, and `user` (with `role.name`). See §4 of
[tap_admin_project_structure.md](tap_admin_project_structure.md) for the
full session flow.

### Error Handling
`getLoginErrorMessage()` maps specific backend error shapes to copy:
invalid credentials, provider-required login (`needLoginViaProvider:<provider>`),
account-locked with a formatted retry countdown, session-expired, and a
generic network-error fallback.

### Local State
`serverError` (string | null) plus react-hook-form's internal form state.

---

## 2. Admin Overview (Dashboard)

**Files:**
- Thin route wrapper: [src/app/admin/page.tsx](src/app/admin/page.tsx) (11 lines, renders `<OverviewClient />`)
- Implementation: [src/app/admin/OverviewClient.tsx](src/app/admin/OverviewClient.tsx)
- Analytics: [src/components/admin/overview/AnalyticsOverview.tsx](src/components/admin/overview/AnalyticsOverview.tsx) → `UserGrowthChart`, `ArtistGenreChart`, `ArtistLocationChart`
**Route:** `/admin`

### UI
**Stats Row** — 4 cards, live data from `useAdminOverview()` (`GET
/admin/overview`), showing `'...'` while loading and `'0'` on a missing
field:

| Card | Field | Icon |
|---|---|---|
| Artists | `data.totArtists` | `Music2` |
| Venues | `data.totVenues` | `Building2` |
| Pending Artist Approvals | `data.totPendingArtist` | `BadgeCheck` |
| Pending Venue Approvals | `data.totPendingVenue` | `Clock3` |

**Analytics section** (`AnalyticsOverview`), stacked below the stat cards:
1. `UserGrowthChart` — Recharts chart driven by `useUserGrowth(range)` (`GET
   /admin/analytics/user-growth?range=7d|30d|3m`)
2. `ArtistGenreChart` — `useArtistGenreDistribution()` (`GET
   /admin/analytics/artist-genres`)
3. `ArtistLocationChart` — `useArtistLocationDistribution()` (`GET
   /admin/analytics/artist-locations`)

All three analytics hooks poll every 30 seconds (`refetchInterval` /
`staleTime` = `REALTIME_POLL_MS`) rather than using a realtime transport —
there is no websocket/SSE in this stack.

### Issues
- None of the stat cards or charts are hardcoded anymore. (Older docs for
  this repo describe fully hardcoded dashboard values — that is no longer
  the case.)

---

## 3. User Management

**Files:**
- Page: [src/app/admin/users/page.tsx](src/app/admin/users/page.tsx) → [UsersClient.tsx](src/app/admin/users/UsersClient.tsx)
- Table: [src/components/admin/users/UserManagementTable.tsx](src/components/admin/users/UserManagementTable.tsx)
**Route:** `/admin/users`

### UI
- **Filter bar:** search-field dropdown (Name / Email / Joined Date / Last
  Login Date), text search input, status filter dropdown (All / Active /
  Not Approved / Inactive / Suspended / Locked / Banned / Deactivated /
  Deleted), role toggle (Artists | Venues)
- **Table columns:** User ID · Name · Email · Joined · Last Login · Status
  (badge) · Actions · ⋮ (more)
- **Pagination:** server-side, driven by `fetchAdminUsers(page, role)` (`GET
  /admin/users?page=&limit=50&role=`)

### User Actions
| Action | Behaviour |
|---|---|
| Switch search field / type in search | Client-side filter over the current page's rows |
| Change status filter / role toggle | Client-side filter; role toggle also changes the server query param |
| Click row (ID/Name/Email) | `router.push(getAdminUserRoute(user))` |
| Click ⋮ (more) | `router.push(getAdminLogRoute(user))` → `/admin/log?userId=&name=` |
| Approve (not-approved artist/venue row) | `approveArtist(id)` / `approveVenue(id)` — real `POST /admin/user/approve` or `/admin/venue/approve` |
| Suspend | Opens a reason dialog (`ReasonPromptDialog`) → `suspendUser(id, reason)` → `POST /admin/user/suspend` |
| Unsuspend | `unsuspendUser(id)` → `POST /admin/user/unsuspend` |
| Ban | Reason dialog → `banUser(id, reason)` → `POST /admin/user/ban` |
| Unlock | `unlockUser(id)` → `PATCH /admin/users/:id/unlock` |
| Reset Password | `forgotPassword(user.email)` → `POST /auth/forgot/password` |

All actions above call real mutations and refetch the table/`admin-users`
query on success — none of them are `console.log`-only.

### Filter Persistence
Filters (`search`, `filter`, `roleFilter`, `statusFilter`, `currentPage`)
are persisted to `sessionStorage` (`user-management-filters`) so they
survive navigating into a detail page and back.

### Row navigation logic (`getAdminUserRoute`)
```
artist + not-approved → /admin/users/artistapproval/[id]
artist + other status → /admin/users/artist/[id]
venue  + not-approved → /admin/users/venueapproval/[id]
venue  + other status → /admin/users/venue/[id]
```

### Data
`User` shape is derived from the backend's `UserBe` via `mapUserToBe()` (see
[tap_admin_data_contracts.md](tap_admin_data_contracts.md) §1) — `status` is
a human-readable label (`Active`, `Not-approved`, `Suspended`, `Locked`,
`Banned`, `Deactivated`, `Deleted`, `Inactive`), not the raw backend enum.

---

## 4. Artist Detail / Inspection

**File:** [src/app/admin/users/artist/[id]/ArtistDetailClient.tsx](src/app/admin/users/artist/%5Bid%5D/ArtistDetailClient.tsx)
**Route:** `/admin/users/artist/[id]`

### UI
Full-width detail view. If the account has no submitted profile yet
(`!artist.hasProfile`), shows a "No Profile Set Up" placeholder with the raw
account status instead of the full layout. Otherwise: 2-column grid — basic
info, genres/style, media (YouTube embed when `videoUrl` is a YouTube link),
music/streaming links (`splitReleases()` separates streaming-platform links
from other release links), booking info, live setup, and a full-width photo
grid.

**Right column:**
- "View Live Profile" / preview action — mints a one-time preview link via
  `mintArtistPreviewLink(id)` (`POST /admin/artist/:id/preview-token`), not
  a hardcoded external URL.
- **Admin Actions:** Suspend (reason dialog) / Unsuspend / Unlock (if
  locked) / Reset Password — all wired to real endpoints (`suspendUser`,
  `unsuspendUser`, `unlockUser`, `forgotPassword`).

### User Actions
| Action | Behaviour |
|---|---|
| Suspend | `ReasonPromptDialog` → `suspendUser(id, reason)`, invalidates `['admin-artist', id]` and `['admin-users']` |
| Unsuspend | `unsuspendUser(id)` |
| Unlock (shown when `accountStatus === 'LOCKED'`) | `unlockUser(id)` |
| Reset Password | `window.confirm(...)` → `forgotPassword(artist.email)` → `window.alert(...)` |
| Preview | Mints and opens a signed preview link |

### Data
`useAdminArtist(id)` → `GET /admin/artist/:id`. Response includes
`accountStatus`, `deletedAt`, `hasProfile`, `email`, `releases[]`, and the
full artist profile fields (see data contracts doc for the complete shape —
this is a live backend DTO, not the old `data_mock/artists.ts` shape).

### Conditional Rendering
- `!artist.hasProfile` → placeholder screen, no admin actions shown
- YouTube embed only when `videoUrl` matches a YouTube URL pattern
- `isSuspended` / `isLocked` / `isDeactivated` / `isDeleted` derived from
  `accountStatus` / `deletedAt`, gate which action buttons render

---

## 5. Artist Approval

**File:** [src/app/admin/users/artistapproval/[id]/ArtistApprovalClient.tsx](src/app/admin/users/artistapproval/%5Bid%5D/ArtistApprovalClient.tsx)
**Route:** `/admin/users/artistapproval/[id]`

### UI
Same profile layout as Artist Detail. Right column has an **Approval
Decision panel**:
- "Feedback" textarea — **controlled** (`feedback` state), required for
  rejection
- Approve button
- Reject button

There is **no "Request Changes" button** in the current UI — the decision
is a two-way Approve/Reject, even though `requestArtistChanges()` still
exists unused in `src/lib/api/admin/artists.ts`.

### User Actions
| Action | Behaviour |
|---|---|
| Approve | `approveArtist(id)` → `POST /admin/user/approve` → on success `router.push('/admin/users')` |
| Reject | Requires non-empty `feedback`; `rejectArtist(id, feedback.trim())` → `POST /admin/user/reject` → redirects to `/admin/users` on success |

Errors from either call are shown via `getFriendlyErrorMessage()` in an
`actionError` banner, not swallowed.

### Data
Same as Artist Detail — `useAdminArtist(id)`.

---

## 6. Venue Detail / Inspection

**File:** [src/app/admin/users/venue/[id]/VenueDetailClient.tsx](src/app/admin/users/venue/%5Bid%5D/VenueDetailClient.tsx)
**Route:** `/admin/users/venue/[id]`

### UI
2-column grid: venue details, capacity & stage, booking preferences, plus a
full-width photo grid.

**Right column:**
- "View Live Profile" button — `window.open(`${NEXT_PUBLIC_PLATFORM_URL}/venues/${data.slug}`)`,
  disabled unless the venue has a `slug` **and** `marketplaceUnlocked`. This
  replaces the old hardcoded Figma prototype link.
- **Admin Actions:** Suspend / Unsuspend / Reset Password (same pattern as
  Artist Detail)
- **`RegionSuggestionsPanel`** — shows any pending region suggestions the
  venue submitted during onboarding, with Add / Dismiss actions
  (`addRegionSuggestion` / `dismissRegionSuggestion` → `POST
  /admin/venue/region-suggestions/add|dismiss`). Renders nothing when there
  are no unresolved suggestions.

### Data
`useAdminVenue(id)` → `GET /admin/venue/:id`. Includes `slug`,
`marketplaceUnlocked`, `email`, and region-suggestion records consumed by
`RegionSuggestionsPanel`.

---

## 7. Venue Approval

**File:** [src/app/admin/users/venueapproval/[id]/VenueApprovalClient.tsx](src/app/admin/users/venueapproval/%5Bid%5D/VenueApprovalClient.tsx)
**Route:** `/admin/users/venueapproval/[id]`

Same pattern as Artist Approval: controlled `feedback` textarea, Approve /
Reject only (no Request Changes button in the UI). `approveVenue(id)` /
`rejectVenue(id, feedback.trim())` → `POST /admin/venue/approve` /
`/admin/venue/reject`; both refresh `['admin-venue', id]` and
`['admin-users']` and redirect to `/admin/users` on success. Also renders
`RegionSuggestionsPanel` (a venue can have pending region suggestions at
approval time too).

---

## 8. Content Moderation Queue

**Files:**
- Page: [src/app/admin/moderation/ModerationClient.tsx](src/app/admin/moderation/ModerationClient.tsx)
- Table: [src/components/admin/moderation/ModerationQueueTable.tsx](src/components/admin/moderation/ModerationQueueTable.tsx)
- Dialogs: [ModerationPreviewDialog.tsx](src/components/admin/moderation/ModerationPreviewDialog.tsx), [RejectReasonDialog.tsx](src/components/admin/moderation/RejectReasonDialog.tsx)
**Route:** `/admin/moderation`

### UI
Filter bar (role toggle, content-type dropdown) + table (User ID · Name ·
Type · Date · Actions). Row click opens `ModerationPreviewDialog` (renders
the flagged image(s)/video and any moderator `reason`). Both the row-level
Reject action and the dialog's Reject action open `RejectReasonDialog`,
which requires non-empty review notes before submitting.

### User Actions
| Action | Behaviour |
|---|---|
| Approve (row or dialog) | `useModerationActions().approveModeration(contentModId)` → `POST /admin/moderation/approve`, then invalidates `['moderation-queue']`; toasts an error on failure |
| Reject (row or dialog) | Opens `RejectReasonDialog` → `rejectModeration({ contentModId, reviewNotes })` → `POST /admin/moderation/reject` |

### Data
`useModerationQueue()` → `GET /admin/moderation` → `ModerationItem[]`
(`contentModId`, `userId`, `email`, `name`, `type`, `role`, `reason`,
`date`, `contentLink`). `resolveContentUrl()` turns a relative
`contentLink` (backend storage path) into an absolute URL by prefixing the
API origin (`NEXT_PUBLIC_API_URL` with `/api/v1` stripped).

---

## 9. Message Moderation

**Files:**
- Page: [src/app/admin/messages/MessagesClient.tsx](src/app/admin/messages/MessagesClient.tsx)
- Thread: [src/components/admin/messages/MessageThread.tsx](src/components/admin/messages/MessageThread.tsx)
**Route:** `/admin/messages`

### UI
Split panel: conversation list (left) + selected thread (right,
`MessageThread`) or a placeholder. Read-only — no send box.

### Data
- List: `useAdminMessages()` → `fetchAdminConversations()` → `GET
  /admin/conversations` → array of `{ conversationId, participants: [p1,
  p2], lastMessageAt }`. `participants` is a **generic 2-party array**
  (`role: 'artist' | 'venue' | 'user'`), not a fixed `artist`/`venue` pair
  as older docs described.
- Thread: `useConversationThread(conversationId)` →
  `fetchConversationThread(id)` → `GET /admin/conversations/:id` → `{
  conversationId, messages: [{ senderId, senderRole, message, isDeleted,
  timestamp, attachments: [{ id, type: 'IMAGE'|'PDF'|'LINK', url, name,
  previewUrl }] }] }`.
- `MessageThread` falls back to hardcoded Unsplash avatar URLs
  (`DEFAULT_AVATARS`) only when a participant has no `avatar`.

### User Actions
| Action | Behaviour |
|---|---|
| Change role dropdown / type search | Client-side filter of the conversation list by participant name/role |
| Click conversation | Loads that thread via `useConversationThread` |

---

## 10. Activity Log Viewer

**File:** [src/app/admin/log/LogClient.tsx](src/app/admin/log/LogClient.tsx)
**Route:** `/admin/log` (wrapped in `<Suspense>` because it reads
`useSearchParams()`)

### UI
Header (title = `name` query param, or "User Activity" / "All Activity")
plus a search box (filters by email/name/event/action/change text) and a
table: Date & Time · Account · Event (badge) · Change (expandable
`<details>` diff when `changeFrom`/`changeTo` present).

### User Actions
| Action | Behaviour |
|---|---|
| Search | Client-side filter over the fetched log set |
| Click a Change row with a diff | Expands/collapses the before→after pills |

### Data
`useAdminLogs(userId)` → `fetchAdminLogs(userId?)` → `GET
/admin/logs?userId=` (or `GET /admin/logs` with no param) → `ActivityLog[]`.
Each entry carries both **actor** (`actorUserId/Name/Email/Role`) and
**target** (`targetId/Name/Email`) info, plus `event`, `action` (raw
backend action code), `change`, `changeFrom`, `changeTo`. The table shows
"· by {actorName}" only when the actor differs from the target (i.e. an
admin acted on someone else's account).

**This is no longer hardcoded to a single user.** `/admin/log` is reached
either with `?userId=&name=` (from the ⋮ menu on a user row, via
`getAdminLogRoute`) to scope to one user, or with no params to show the
platform-wide activity feed.

---

## 11. Resource Management

**Files:**
- Page: [src/app/admin/resources/ResourcesClient.tsx](src/app/admin/resources/ResourcesClient.tsx)
- Row: [SortableRow.tsx](src/app/admin/resources/SortableRow.tsx)
- Dialogs: [CreateResourceDialog.tsx](src/components/admin/resources/CreateResourceDialog.tsx), [ViewResourceDialog.tsx](src/components/admin/resources/ViewResourceDialog.tsx)
**Route:** `/admin/resources`

### UI
"Create Resource" button + sortable table (`@dnd-kit`, `PointerSensor`) —
drag handle, Type, Title + Description, Actions (View / Delete).

### Drag-and-Drop — persisted, not local-only
Local `items` state (synced from the query via `useEffect`) drives the drag
UI, but on drop the reordered list is written back with `useUpdateResources()`
→ `PUT /admin/resources` (bulk replace: `{ items: ResourceItemInput[] }`
with each item's `index` set from its new position). This supersedes older
documentation describing reorder as ephemeral/local-only.

### `CreateResourceDialog`
react-hook-form + zod (`resourceSchema.ts`). Fields: `type` (`youtube` |
`website` | `pdf`), `title`, `description`, `category`, `url` (for
youtube/website), `pdfFile` (upload, for `pdf` type), `thumbnailFile`
(optional image upload, compressed client-side via `compressImage()` before
upload). File fields upload through `uploadMedia()`
(`src/lib/api/media.ts`) before the resource record is created/saved.

### `ViewResourceDialog`
Same field set, pre-filled from the selected `Resource`, editable and
saved through the same `useUpdateResources()` bulk-PUT path.

### Data
`useResources()` → `GET /admin/resources` → `Resource[]` (`id`, `index`,
`type: 'youtube'|'website'|'pdf'`, `title`, `description`, `url`,
`category`, `thumbnailUrl`, `createdAt`, `updatedAt`). Note: the resource
type union is `youtube | website | pdf`, not `youtube | website | document`
as in older docs.

---

## 12. Vendor Management (Marketplace)

**Files:**
- Page: [src/app/admin/vendors/VendorsClient.tsx](src/app/admin/vendors/VendorsClient.tsx)
- Tables: [CategoriesTable.tsx](src/components/admin/vendors/CategoriesTable.tsx), [ListingsTable.tsx](src/components/admin/vendors/ListingsTable.tsx)
- Dialogs: [CategoryDialog.tsx](src/components/admin/vendors/CategoryDialog.tsx), [ListingDialog.tsx](src/components/admin/vendors/ListingDialog.tsx)
**Route:** `/admin/vendors`

This screen did not exist in earlier versions of this codebase — it manages
the marketplace vendor directory shown on the public site.

### UI
Two tabs (shadcn `Tabs`): **Listings** and **Categories**.

- **Categories tab:** `CategoriesTable` — hierarchical (top-level categories
  with nested children by `parentCategory`), Create / Edit / Delete via
  `CategoryDialog`.
- **Listings tab:** `ListingsTable` — searchable, filterable by a
  hardcoded top-level type (`all` / `services` / `products-and-tools`,
  derived from `listing.category.parentCategory.slug`), Create / Edit /
  Delete via `ListingDialog`. `ListingDialog` also manages up to
  `MAX_PHOTOS = 5` listing photos (logo/hero/normal), uploading through
  `uploadMediaAsset()` (`POST /media-assets/upload`) then attaching via
  `createVendorListingPhoto()` (`POST /vendors/listing-photos`).

### Data / Endpoints
| Resource | Fetch | Mutations |
|---|---|---|
| Categories | `GET /vendors/categories?limit=100` | `POST` / `PATCH /vendors/categories/:id` / `DELETE /vendors/categories/:id` |
| Listings | `GET /vendors/listings?limit=100` | `POST` / `PATCH /vendors/listings/:id` / `DELETE /vendors/listings/:id` |
| Listing photos | `GET /vendors/listing-photos?vendorListingId=` | `POST /vendors/listing-photos`, `DELETE /vendors/listing-photos/:id` |

All vendor endpoints are under `/vendors/*`, **not** `/admin/vendors/*` —
see [tap_admin_project_structure.md](tap_admin_project_structure.md) §3.

---

## 13. Shared Layout — App Sidebar

**File:** [src/components/admin/layout/SideBar.tsx](src/components/admin/layout/SideBar.tsx)
**Wraps:** All `/admin/*` routes (mounted in `src/app/admin/layout.tsx`)

### UI
Collapsible shadcn `<Sidebar collapsible="icon">` with two labeled groups:

- **Management:** Overview, User Management, Content Moderation, Activity
  Logs, Message Moderation
- **Marketplace:** Resources, Products & Services (`/admin/vendors`)

**Footer:** Logout button — `useAuthContext().logout()` (real `POST
/auth/logout` + full local state wipe), then `queryClient.removeQueries({
queryKey: ['me'] })` and `router.push('/login')`. This is a real logout, not
the old `// TEMP MOCK LOGOUT` stub.

### Conditional Rendering
- Active nav item highlighted on exact `pathname === item.url` match only —
  sub-routes (e.g. `/admin/users/artist/1`) do not highlight "User
  Management".
- Collapsed state hides labels/logo text, centers icons.
