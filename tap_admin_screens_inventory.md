# TAP Admin — Screens & Components Inventory

> ⚠️ **AUDIT UPDATE — 2026-06-24:** The line below — *"All data is currently mock… No real backend is connected"* — is **no longer true**. The admin now talks to the live backend through Next.js BFF routes under `src/app/api/**` (`backendFetch` → `BACKEND_API_URL`). Screens present today: users (artist/venue + artistapproval/venueapproval), moderation, resources, messages, log. A few routes may still return mock data — verify per route. Consolidated state: `../tap-platform/projectUpdate24June.md`.

> Generated: 2026-06-03  
> All data is currently mock (in-memory). No real backend is connected.

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
12. [Shared Layout — App Sidebar](#12-shared-layout--app-sidebar)
13. [Stub / Placeholder Pages](#13-stub--placeholder-pages)

---

## 1. Login Page

**File:** [src/app/login/page.tsx](src/app/login/page.tsx)  
**Route:** `/login`

### UI
Centered card on a full-screen background. Contains:
- TAP logo (`/Primary.svg`)
- "TAP ADMIN" label + "Welcome Back" heading (Cormorant Garamond font)
- Email input (`<Input>`)
- Password input (`<Input type="password">`)
- "Sign In" button (gold background)

### User Actions
| Action | Behaviour |
|---|---|
| Type email/password | Updates controlled input state |
| Click "Sign In" | `router.push("/admin")` — **no validation, no API call** |

### Data
None. No API call. No credential check.

```
// TEMP MOCK LOGIN
router.push("/admin")
```

### Local State
| State | Type | Purpose |
|---|---|---|
| `email` | `string` | Controlled email input |
| `password` | `string` | Controlled password input |

### Conditional Rendering
None.

### Issues
- Authentication is entirely absent. Any user navigating directly to `/admin` bypasses this screen.
- No error state for bad credentials.
- No "Forgot password" link.

---

## 2. Admin Overview (Dashboard)

**Files:**  
- Page: [src/app/admin/page.tsx](src/app/admin/page.tsx)  
- Chart component: [src/components/admin/overview/GrowthChart.tsx](src/components/admin/overview/GrowthChart.tsx)  
**Route:** `/admin`

### UI
Two main sections stacked vertically:

**Stats Row** — 4 cards in a responsive grid (1 col → 2 col → 4 col):
| Card | Value (hardcoded) | Icon |
|---|---|---|
| Artists | 1,284 | `Music2` |
| Venues | 148 | `Building2` |
| Pending Artist Approvals | 23 | `BadgeCheck` |
| Pending Venue Approvals | 11 | `Clock3` |

Each card has a subtle gold glow in the top-right corner.

**Platform Growth Chart** (`GrowthChart` component) — Recharts `AreaChart` with two area series (Artists, Venues). Gradient fills, custom tooltip, no Y-axis line/ticks decorations.

### User Actions
Chart has interactive controls:
| Control | Type | Options |
|---|---|---|
| Toggle Artists series | Button (toggle) | On / Off |
| Toggle Venues series | Button (toggle) | On / Off |
| Time range | Segmented button | 14 Days / Month / Year |

### Data

**Stats cards:** Hardcoded inline in `page.tsx` — not from any API.
```ts
const stats = [
  { title: "Artists", value: "1,284", icon: Music2 },
  { title: "Venues", value: "148", icon: Building2 },
  { title: "Pending Artist Approvals", value: "23", icon: BadgeCheck },
  { title: "Pending Venue Approvals", value: "11", icon: Clock3 },
]
```

**Chart data:** Hardcoded in `GrowthChart.tsx` — three static datasets keyed by time range.
```ts
const dataMap = {
  "14d": [ { label: "Day 1", artists: 120, venues: 22 }, ... 7 points ],
  "30d": [ { label: "Week 1", artists: 420, venues: 68 }, ... 4 points ],
  "1y":  [ { label: "Jan", artists: 320, venues: 45 }, ... 12 points ],
}
```

### Local State (`GrowthChart`)
| State | Type | Default | Purpose |
|---|---|---|---|
| `range` | `"14d" \| "30d" \| "1y"` | `"30d"` | Active dataset |
| `showArtists` | `boolean` | `true` | Show/hide Artists series |
| `showVenues` | `boolean` | `true` | Show/hide Venues series |

### Conditional Rendering
- Artists `<Area>` only rendered when `showArtists === true`
- Venues `<Area>` only rendered when `showVenues === true`
- Chart dataset switches based on `range`

### Issues
- All stats are hardcoded strings. They will never reflect real platform data.
- No link from stat cards to their respective filtered views.

---

## 3. User Management

**Files:**  
- Page: [src/app/admin/users/page.tsx](src/app/admin/users/page.tsx)  
- Table component: [src/components/admin/users/UserManagementTable.tsx](src/components/admin/users/UserManagementTable.tsx)  
**Route:** `/admin/users`

### UI
Page header + `UserManagementTable` component.

The table contains:
- **Filter bar** (top):
  - Search-field dropdown (search by: Name, UserId, Email, Joined Date, Last Login Date)
  - Text search input
  - Status filter dropdown (All / Active / Not Approved / Suspended / Banned)
  - Role toggle buttons: **Artists** | **Venues** (pill style, coloured when active)
- **Table columns:** User ID · Name · Email · Joined Date · Last Login Date · Status (coloured badge) · Actions · ⋮ (more)
- **Pagination row** (bottom): "Showing X–Y of Z" + Previous / numbered page buttons / Next

### User Actions
| Action | Behaviour |
|---|---|
| Switch search field | Updates `filter` state, changes input placeholder |
| Type in search input | Filters `filteredUsers` in real-time |
| Change status filter | Filters by user status |
| Toggle Artists / Venues | Filters by `user.role` |
| Click table row (Name or ID cell) | `router.push(getAdminUserRoute(user))` — navigates to detail or approval page based on role+status |
| Click ⋮ (more) button | `router.push(getAdminLogRoute(user))` → `/admin/log` |
| Click "Approve" (not-approved rows) | Button rendered, **no handler wired** (UI only) |
| Click "Reject" (not-approved rows) | Button rendered, **no handler wired** (UI only) |
| Click "Suspend" (active rows) | Button rendered, **no handler wired** (UI only) |
| Click "Ban" (active/suspended rows) | Button rendered, **no handler wired** (UI only) |
| Click "Unsuspend" (suspended rows) | Button rendered, **no handler wired** (UI only) |
| Click "Unban" (banned rows) | Button rendered, **no handler wired** (UI only) |
| Click Previous / Next / page number | Updates `currentPage` |

### Row navigation logic (`getAdminUserRoute`):
```
artist + not-approved → /admin/users/artistapproval/[id]
artist + other status → /admin/users/artist/[id]
venue  + not-approved → /admin/users/venueapproval/[id]
venue  + other status → /admin/users/venue/[id]
```

### Data
Fetched via `useAdminUsers()` → `GET /api/admin/users` → `mockUsers` in `src/data_mock/users.ts`.

```ts
// Mock shape (5 records):
{ id, name, email, role: 'artist'|'venue', joined, lastlogin,
  status: 'active'|'not-approved'|'suspended'|'banned' }
```

### Local State
| State | Type | Default | Purpose |
|---|---|---|---|
| `search` | `string` | `""` | Text search value |
| `filter` | `string` | `"name"` | Which field to search against |
| `roleFilter` | `string` | `"artist"` | Role tab (artist / venue) |
| `statusFilter` | `string` | `"all"` | Status dropdown value |
| `currentPage` | `number` | `1` | Active pagination page |

### Conditional Rendering
- Action buttons rendered per row via `renderActions(user.status)` — different button set for each status:
  - `active` → Suspend + Ban
  - `not-approved` → Approve + Reject
  - `suspended` → Unsuspend + Ban
  - `banned` → Unban
- Status badge colour driven by `getStatusStyles(status)` — maps to CSS token pairs (`--status-active-*`, `--status-pending-*`, `--status-suspended-*`, `--status-banned-*`)
- Loading state: plain text "Loading users..."
- Error state: plain red text "Failed to load users"
- Page numbers only shown when `totalPages > 0`

### Issues
- `ITEMS_PER_PAGE = 50` but there are only 5 mock users, so pagination never activates.
- All action buttons (Approve, Reject, Suspend, Ban, etc.) have no `onClick` handlers — purely visual.

---

## 4. Artist Detail / Inspection

**File:** [src/app/admin/users/artist/[id]/page.tsx](src/app/admin/users/artist/%5Bid%5D/page.tsx)  
**Route:** `/admin/users/artist/[id]`

### UI
Full-width detail view, 2-column grid (left: content, right: admin actions).

**Left column** (7 sections):
1. **Basic Info** — stage name, artist type, location (city), open to travel, travel radius, short bio, extended bio
2. **Genres & Style** — genre tags (pill badges), performance type, style, act type, energy level
3. **Media** — embedded YouTube iframe (16:9) if video URL is YouTube, social media handles (Instagram, TikTok, YouTube, Facebook, X)
4. **Music Links** — list of platform + URL pairs with gold link icons
5. **Booking** — fee range (currency, min, max), availability days, set lengths
6. **Live Setup** — setup type, equipment list, technical notes
7. **Artist Photos** (full-width section below grid) — responsive image grid (2 → 4 cols)

**Right column:**
- "Show Preview" button (opens Figma prototype URL in new tab — hardcoded)
- **Admin Actions panel**: Suspend · Ban · Reset Password buttons

### User Actions
| Action | Behaviour |
|---|---|
| Click "Show Preview" | Opens `https://civic-sauna-76601524.figma.site/` (hardcoded Figma link) |
| Click "Suspend" | **No handler** — UI only |
| Click "Ban" | **No handler** — UI only |
| Click "Reset Password" | **No handler** — UI only |

### Data
Fetched via `useAdminArtist(id)` → `GET /api/admin/artist/[id]` → `artists` array in `src/data_mock/artists.ts`.

```ts
// Mock shape:
{
  id, basicInfo: { stageName, profilePicture, shortBio, extendedBio,
    location: { city, regions }, artistType, openToTravel, travelRadius },
  genres: { genres[], performanceType, performanceStyle, actType, energyLevel },
  media: { images[], videoUrl, socialMedia: { instagram, tiktok, youtube, facebook, x } },
  photos: { images: [{ url }] },
  musicLinks: { links: [{ id, platform, url }] },
  bookingInfo: { availability[], feeRange: { min, max, currency }, setLengths[] },
  liveSetup: { setupType, equipment[], technicalNotes }
}
```

### Local State
None — page is fully driven by React Query data.

### Conditional Rendering
- YouTube embed only shown when `data.media.videoUrl` exists AND matches YouTube URL pattern
- Fallback "No video provided" text when no video URL
- Location: handles both string and `{ city }` object shapes
- Photo grid: "No images uploaded" if `data.photos.images.length === 0`
- Loading state: plain text "Loading artist..."
- Error state: centered "Artist not found"

---

## 5. Artist Approval

**File:** [src/app/admin/users/artistapproval/[id]/page.tsx](src/app/admin/users/artistapproval/%5Bid%5D/page.tsx)  
**Route:** `/admin/users/artistapproval/[id]`

### UI
Identical layout to Artist Detail (same 7 left-column sections). Right column differs:

**Right column:**
- "Show Preview" button (same hardcoded Figma URL)
- **Approval Decision panel:**
  - "Feedback to User" `<textarea>` (uncontrolled — no state variable)
  - Approve button (green)
  - Request Changes button (amber/warning)
  - Reject button (red)

### User Actions
| Action | Behaviour |
|---|---|
| Click "Show Preview" | Opens `https://civic-sauna-76601524.figma.site/` |
| Type in feedback textarea | Visual only — uncontrolled input, no state binding |
| Click "Approve" | **No handler** — UI only |
| Click "Request Changes" | **No handler** — UI only |
| Click "Reject" | **No handler** — UI only |

### Data
Same as Artist Detail — `useAdminArtist(id)` hook (same API endpoint and mock data).

### Local State
None.

### Conditional Rendering
Same as Artist Detail. No approval-specific conditional logic.

### Issues
- Feedback textarea is uncontrolled — its value cannot be read or submitted.
- All three decision buttons are non-functional.
- The page heading says "Artist Approval" (vs "Artist Inspection") but the data model is identical.

---

## 6. Venue Detail / Inspection

**File:** [src/app/admin/users/venue/[id]/page.tsx](src/app/admin/users/venue/%5Bid%5D/page.tsx)  
**Route:** `/admin/users/venue/[id]`

### UI
2-column grid layout.

**Left column** (3 sections):
1. **Venue Details** — name, address (street, city, state, zip), description
2. **Capacity & Stage** — capacity number, stage available (bool), stage dimensions, sound system list, sound system notes, amenities
3. **Booking Preferences** — event types, accepted genres, pricing model, min/max price, booking notes

**Right column:**
- "Show Preview" button (hardcoded Figma URL)
- **Admin Actions panel**: Suspend Venue · Ban Venue · Reset Password
- **Quick Summary mini-card**: capacity, stage, city

**Below grid:**
- **Venue Photos** — full-width image grid (2 → 4 cols)

### User Actions
| Action | Behaviour |
|---|---|
| Click "Show Preview" | Opens `https://civic-sauna-76601524.figma.site/` |
| Click "Suspend Venue" | **No handler** |
| Click "Ban Venue" | **No handler** |
| Click "Reset Password" | **No handler** |

### Data
Fetched via `useAdminVenue(params.id)` → `GET /api/admin/venue/[id]` → `venues` array in `src/data_mock/venues.ts`.

```ts
// Mock shape:
{
  id, venueDetails: { venueName, address, city, state, zipCode, description },
  capacitySpecs: { capacity, hasStage, stageDimensions, soundSystem[],
                   soundSystemNotes, amenities[] },
  photos: { images: [{ url }] },
  bookingPreferences: { eventTypes[], genres[], pricingModel,
                        minPrice, maxPrice, bookingNotes }
}
```

> **Bug:** This page uses `params.id` without `use(params)` (synchronous params access). The `[id]` sibling under `venueapproval` correctly uses `use(params)`. This will produce a Next.js warning in v16.

### Local State
None.

### Conditional Rendering
- Sound system: falls back to "None listed" if empty
- Photos: "No images uploaded" if empty
- Loading / error states

---

## 7. Venue Approval

**File:** [src/app/admin/users/venueapproval/[id]/page.tsx](src/app/admin/users/venueapproval/%5Bid%5D/page.tsx)  
**Route:** `/admin/users/venueapproval/[id]`

### UI
Identical layout to Venue Detail. Right column has the **Approval Decision panel** (same as Artist Approval):
- "Feedback to User" uncontrolled textarea
- Approve / Request Changes / Reject buttons

### User Actions
Same pattern as [Artist Approval](#5-artist-approval) — all decision buttons are non-functional.

### Data
`useAdminVenue(id)` — same hook/mock data as Venue Detail. Uses correct `use(params)` async pattern.

### Local State
None.

### Conditional Rendering
Same as Venue Detail.

---

## 8. Content Moderation Queue

**Files:**  
- Page: [src/app/admin/moderation/page.tsx](src/app/admin/moderation/page.tsx)  
- Table: [src/components/admin/moderation/ModerationQueueTable.tsx](src/components/admin/moderation/ModerationQueueTable.tsx)  
- Dialog: [src/components/admin/moderation/ModerationPreviewDialog.tsx](src/components/admin/moderation/ModerationPreviewDialog.tsx)  
**Route:** `/admin/moderation`

### UI

**Filter bar** (inside `ModerationQueueTable`):
- Role toggle: Artists | Venues (pill buttons)
- Content type dropdown: All / Images / Video

**Table columns:** User ID · Name · Type (gold badge) · Date · Actions (Approve / Reject buttons)

**Row click** opens `ModerationPreviewDialog` modal:
- Header: "Moderation Review" label + user name + content type + "View Profile" button (hardcoded Figma URL)
- Content area: renders based on `item.type`:
  - `images` / `profile-pic` → tries `JSON.parse(item.content)` first, falls back to single `<img>` tag
  - `video` → `<iframe src={item.content}>`
  - `social-links` / `music-links` → JSON parsed link list
  - default → plain text
- Footer: User ID, submission date, Reject + Approve buttons

### User Actions
| Action | Behaviour |
|---|---|
| Toggle Artists / Venues | Filters table by `item.role` |
| Change type dropdown | Filters by `item.type` |
| Click "Approve" (table row) | Calls `onApprove(id)` → `console.log("approve", id)` |
| Click "Reject" (table row) | Calls `onReject(id)` → `console.log("reject", id)` |
| Click anywhere on a row | Opens preview dialog for that item |
| Click "View Profile" (dialog) | Opens `https://civic-sauna-76601524.figma.site/` |
| Click "Approve" (dialog footer) | Calls `onApprove(id)` → `console.log` |
| Click "Reject" (dialog footer) | Calls `onReject(id)` → `console.log` |

### Data
Fetched via `useModerationQueue()` → `GET /api/admin/moderation` → `moderationData` in `src/data_mock/moderation.ts`.

```ts
// Mock shape (8 records):
{
  id: "mod_001",
  userId: "usr_1001",
  name: "Aria Stone",
  type: "images",   // "images" | "video"
  role: "artist",   // "artist" | "venue"
  date: "2026-05-10",
  content: "https://images.unsplash.com/..."  // URL string
}
```

### Local State

**Page (`moderation/page.tsx`):**
| State | Type | Default | Purpose |
|---|---|---|---|
| `selectedItem` | `any \| null` | `null` | Item to show in preview dialog |
| `open` | `boolean` | `false` | Dialog open/close |

**`ModerationQueueTable`:**
| State | Type | Default | Purpose |
|---|---|---|---|
| `roleFilter` | `string` | `"artist"` | Artist/Venue toggle |
| `typeFilter` | `string` | `"all"` | Content type filter |

### Conditional Rendering
- Table filtered by both `roleFilter` and `typeFilter` simultaneously
- Dialog content rendered via switch on `item.type`
- Image content tries `JSON.parse` first for multi-image arrays, catches and falls back to single image
- Loading: "Loading moderation queue..."
- Error: "Failed to load moderation data" (red text)

### Issues
- Approve/Reject handlers are `console.log` only. No optimistic update removes the item from the table.
- The `renderContent` switch in `ModerationPreviewDialog` handles `social-links` and `music-links` types that don't exist in the current mock data.

---

## 9. Message Moderation

**Files:**  
- Page: [src/app/admin/messages/page.tsx](src/app/admin/messages/page.tsx)  
- Thread: [src/components/admin/messages/MessageThread.tsx](src/components/admin/messages/MessageThread.tsx)  
**Route:** `/admin/messages`

### UI
Split-panel layout (full viewport height minus header):

**Left panel** (360px fixed width):
- **Search bar**: role dropdown (All / Artist / Venue) + text input
- **Conversation list**: scrollable list of conversations sorted by most recent message. Each item shows:
  - Artist name (gold "Artist" badge)
  - Venue name (teal "Venue" badge)
  - "Last Messaged" label + formatted timestamp

**Right panel** (flex-grow):
- `MessageThread` component for the selected conversation, or "Select a conversation" placeholder

**`MessageThread` component:**
- **Header**: artist avatar (Unsplash fallback) ↔ venue name + conversation ID, venue avatar
- **Message bubbles**: artist messages right-aligned (dark `--ink` background), venue messages left-aligned (muted background). Each bubble shows:
  - Sender name label
  - Message text
  - Attachments (type-rendered): image → `<img>`, video → `<video controls>`, audio → `<audio controls>`, pdf/document → hyperlink
  - Timestamp

### User Actions
| Action | Behaviour |
|---|---|
| Change role dropdown | Updates `searchFilter` — filters conversation list |
| Type in search input | Updates `search` — filters by artist or venue name |
| Click conversation item | Updates `selected` state — renders that thread on the right |

> **Read-only.** There is no input box to send messages. This is a moderation view only.

### Data
Fetched via `useAdminMessages()` → `GET /api/admin/messages` → `conversationsMock` in `src/data_mock/conversations.ts`.

```ts
// Mock shape (4 conversations):
{
  id: "c1",
  artist: { id: "artist1", name: "The Midnight Duo" },
  venue:  { id: "venue1",  name: "Ocean Breeze Lounge" },
  messages: [{
    id, senderId, content, timestamp: Date,
    attachments?: [{ id, type: "image"|"video"|"audio"|"pdf"|"document", name, url, size? }]
  }]
}
```

### Local State (page)
| State | Type | Default | Purpose |
|---|---|---|---|
| `selected` | `Conversation \| null` | First item after load | Active conversation |
| `search` | `string` | `""` | Search text |
| `searchFilter` | `string` | `"all"` | Role filter for search |

`useEffect` auto-selects the first conversation once data loads.

`useMemo` computes `filtered` from `conversations`, `search`, and `searchFilter`, then sorts by last message timestamp descending.

### Conditional Rendering
- Right panel shows `MessageThread` if `selected`, else placeholder text
- Message bubbles: `isArtist` check flips alignment and colours
- In `MessageThread`, avatar fallbacks to hardcoded Unsplash URLs when `conversation.artist.avatar` / `conversation.venue.avatar` are undefined (they always are in mock data)
- Attachment rendering: branching on `a.type`
- Loading: "Loading messages..."
- Error: "Failed to load messages" (red text)

---

## 10. Activity Log Viewer

**File:** [src/app/admin/log/page.tsx](src/app/admin/log/page.tsx)  
**Route:** `/admin/log`

### UI
Two sections:
1. **User card** — activity log header with user name ("Aria Stone"), user ID ("usr_1001"), and "Activity Logs" sub-label
2. **Log table** — columns: Date & Time · Event (gold pill badge) · Change

The Change cell uses a `<details>` / `<summary>` accordion:
- If the log has `changeFrom` or `changeTo`, a ▼ chevron appears and the row is expandable
- Expanded content shows before → after values as coloured pills (red = from, green = to)
- Handles three diff display modes: remove-only, add-only, before → after

### User Actions
| Action | Behaviour |
|---|---|
| Click Change row (with diff) | Expands/collapses native `<details>` accordion showing before/after values |

No search, filter, sort, or pagination.

### Data
Fetched via `useAdminLogs()` → `GET /api/admin/logs` → `activityLogsMock` in `src/data_mock/activityLogs.ts`.

```ts
// Mock shape (16 records, all for userId "usr_1001"):
{
  id: "log_001",
  userId: "usr_1001",
  time: Date,
  event: "login"|"logout"|"approval"|"name-change"|"profile-update"|
         "media-upload"|"password-reset"|"suspended"|"banned"|"other",
  change: string,   // human-readable description
  changeFrom?: string,
  changeTo?: string
}
```

Dates formatted with `date-fns` `format(log.time, "yyyy-MM-dd HH:mm")`.

### Local State
None. Page is driven entirely by the React Query hook.

### Conditional Rendering
- `hasDiff` = `log.changeFrom || log.changeTo` — controls whether the row is expandable
- Diff display:
  - `changeFrom` only → shows red "removed" pill
  - `changeTo` only → shows green "added" pill
  - both → shows red pill → arrow → green pill
- Loading: "Loading logs..."
- Error: "Failed to load logs" (red text)

### Issues
- **Hardcoded user context.** The page always shows `{ name: "Aria Stone", id: "usr_1001" }`. There is no mechanism to pass which user's logs to display — the URL has no `[id]` parameter and the API returns all logs regardless.
- The ⋮ button in `UserManagementTable` navigates to `/admin/log` for any user, but this page will always show Aria Stone's logs.

---

## 11. Resource Management

**Files:**  
- Page: [src/app/admin/resources/page.tsx](src/app/admin/resources/page.tsx)  
- Sortable row: [src/app/admin/resources/SortableRow.tsx](src/app/admin/resources/SortableRow.tsx)  
- Create dialog: [src/components/admin/resources/CreateResourceDialog.tsx](src/components/admin/resources/CreateResourceDialog.tsx)  
- View/edit dialog: [src/components/admin/resources/ViewResourceDialog.tsx](src/components/admin/resources/ViewResourceDialog.tsx)  
**Route:** `/admin/resources`

### UI
- Page heading "Resource Management"
- **"Create Resource" button** (gold, triggers `CreateResourceDialog`)
- **Sortable table** (dnd-kit): columns — ⠿ drag handle · Type · Title + Description · Actions (View / Delete)
- **`ViewResourceDialog`** (opens on View click): split 2-column layout — edit form (left) + live preview (right)

### Drag-and-Drop
Using `@dnd-kit/core` with `PointerSensor` (activates after 5px drag distance). Items are reordered in local state only — no persist API call.

### `CreateResourceDialog` (modal)
Fields:
| Field | Control | Notes |
|---|---|---|
| Resource Type | `<Select>` | youtube / website / document |
| Title | `<Input>` | |
| Description | `<Textarea>` | |
| URL | `<Input>` | Shown when type = youtube or website |
| PDF Upload | File input (drag area) | Shown when type = document |

Submit: `console.log({type, title, description, url, pdfFile})` — no API call.

### `ViewResourceDialog` (modal)
Shows existing resource data in an editable form with a live preview panel on the right:
- YouTube → embedded iframe
- Website → clickable link
- Document → "PDF Document" label + filename

Save: `console.log({type, title, description, url})` — no API call.

### User Actions
| Action | Behaviour |
|---|---|
| Drag row | Reorders `items` array in local state |
| Click "View" | Sets `selectedResource` + opens `ViewResourceDialog` |
| Click "Delete" (trash icon) | **No handler** — UI only |
| Click "Create Resource" | Opens `CreateResourceDialog` |
| Fill & submit Create form | `console.log` only |
| Edit & save in View dialog | `console.log` only |

### Data
Fetched via `useResources()` → `GET /api/admin/resources` → `resourcesMock` in `src/data_mock/resources.ts`.

```ts
// Mock shape (12 records):
{
  id: "res_001",
  type: "youtube" | "website" | "document",
  title: string,
  description: string,
  url: string
}
```

Query data synced to local `items` state via `useEffect` so dnd-kit can manage order without mutating React Query cache.

### Local State (page)
| State | Type | Default | Purpose |
|---|---|---|---|
| `items` | `Resource[]` | `[]` | Local ordered copy of resources (for dnd) |
| `selectedResource` | `any \| null` | `null` | Resource to show in ViewDialog |
| `open` | `boolean` | `false` | ViewDialog open/close |

### Local State (`CreateResourceDialog`)
| State | Type | Default | Purpose |
|---|---|---|---|
| `type` | `"youtube"\|"website"\|"document"` | `"youtube"` | Resource type |
| `title` | `string` | `""` | Title field |
| `description` | `string` | `""` | Description field |
| `url` | `string` | `""` | URL field |
| `pdfFile` | `File \| null` | `null` | Uploaded PDF |

### Local State (`ViewResourceDialog`)
| State | Type | Default | Purpose |
|---|---|---|---|
| `type` | resource type | from prop | Editable type |
| `title` | `string` | from prop | Editable title |
| `description` | `string` | from prop | Editable description |
| `url` | `string` | from prop | Editable URL |

`useEffect` resets form state when `resource` prop changes.

### Conditional Rendering
- URL input: only shown when `type === "youtube" || type === "website"`
- PDF upload area: only shown when `type === "document"`
- Preview panel: three branches (iframe / link / PDF label)
- `ViewResourceDialog`: only rendered when `selectedResource !== null`

### Issues
- Drag reorder is ephemeral — lost on page refresh.
- Delete button has no `onClick` handler.
- Create and Save both only `console.log` — nothing is persisted.

---

## 12. Shared Layout — App Sidebar

**File:** [src/components/admin/layout/SideBar.tsx](src/components/admin/layout/SideBar.tsx)  
**Wraps:** All `/admin/*` routes (mounted in `src/app/admin/layout.tsx`)

### UI
Collapsible sidebar using shadcn/ui `<Sidebar collapsible="icon">`.

**Header:** TAP logo + "TAP ADMIN" label + collapse trigger button. When collapsed, only the trigger button shows.

**Navigation** (5 items):
| Label | Route | Icon |
|---|---|---|
| Overview | `/admin` | `LayoutDashboard` |
| User Management | `/admin/users` | `Users` |
| Content Moderation | `/admin/moderation` | `ShieldAlert` |
| Message Moderation | `/admin/messages` | `MessageSquare` |
| Help Resources | `/admin/resources` | `BookOpen` |

**Footer:** Logout button.

### User Actions
| Action | Behaviour |
|---|---|
| Click nav item | `<a href={item.url}>` standard navigation |
| Click logout | `router.push("/login")` — `// TEMP MOCK LOGOUT` comment |
| Click collapse trigger | Toggles sidebar between full and icon-only mode (shadcn sidebar state) |

### Local State
None directly — uses `useSidebar()` context from shadcn and `usePathname()` from Next.js.

### Conditional Rendering
- Active nav item: highlighted when `pathname === item.url` (white background, foreground-coloured text)
- Collapsed: hides logo text, hides nav labels (icons only), justifies header center
- Collapsed: `SidebarMenuButton` with `asChild` keeps icons visible

### Issues
- Active state only matches on exact path (`pathname === item.url`). Sub-routes like `/admin/users/artist/1` won't highlight "User Management".

---

## 13. Stub / Placeholder Pages

These pages exist as files but contain duplicate code from detail/approval pages and serve no distinct function at their routes.

### `/admin/users/artist/page.tsx`
**Route:** `/admin/users/artist`  
**File:** [src/app/admin/users/artist/page.tsx](src/app/admin/users/artist/page.tsx)

Contains an exact copy of the Artist Detail page (`artist/[id]/page.tsx`) including `params: Promise<{ id: string }>`. At this route, there is no `id` segment, so `id` would be `undefined`, and the `useAdminArtist(undefined)` call would be disabled by the `enabled: !!id` guard — resulting in a blank loading screen. **This is a copy-paste error.**

### `/admin/users/artistapproval/page.tsx`
**Route:** `/admin/users/artistapproval`  
**File:** [src/app/admin/users/artistapproval/page.tsx](src/app/admin/users/artistapproval/page.tsx)

Same issue — copy of the Artist Approval `[id]` page with no dynamic segment. Effectively dead route.

### `/admin/users/venue/page.tsx`
**Route:** `/admin/users/venue`  
**File:** [src/app/admin/users/venue/page.tsx](src/app/admin/users/venue/page.tsx)

Copy of the Venue Detail page. Same problem — `params.id` would be `undefined`.

### `/admin/users/venueapproval/page.tsx`
**Route:** `/admin/users/venueapproval`  
**File:** [src/app/admin/users/venueapproval/page.tsx](src/app/admin/users/venueapproval/page.tsx)

Copy of the Venue Approval page. Same problem.

---

## Summary Table

| Screen | Route | Real API? | Functional Actions? | Modal/Dialog? | Local State? |
|---|---|---|---|---|---|
| Login | `/login` | No | No (mock redirect) | No | email, password |
| Overview Dashboard | `/admin` | No (hardcoded) | Chart toggles only | No | range, showArtists, showVenues |
| User Management | `/admin/users` | Mock | No (buttons UI-only) | No | search, filter, role, status, page |
| Artist Detail | `/admin/users/artist/[id]` | Mock | No | No | None |
| Artist Approval | `/admin/users/artistapproval/[id]` | Mock | No | No | None |
| Venue Detail | `/admin/users/venue/[id]` | Mock | No | No | None |
| Venue Approval | `/admin/users/venueapproval/[id]` | Mock | No | No | None |
| Content Moderation | `/admin/moderation` | Mock | No (console.log) | Yes — preview | selectedItem, open, roleFilter, typeFilter |
| Message Moderation | `/admin/messages` | Mock | Read-only | No | selected, search, searchFilter |
| Activity Log | `/admin/log` | Mock | None | No | None |
| Resource Management | `/admin/resources` | Mock | No (console.log) | Yes — create + view/edit | items, selectedResource, open + form state |
| Sidebar | (layout) | N/A | Logout (mock) | No | useSidebar context |
