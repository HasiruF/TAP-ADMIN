# TAP Admin — Data Contracts

> 🗂️ **AUDIT NOTE — 2026-06-24:** Field contracts here largely predate live backend wiring; many "dummy-data shapes" are now served by real endpoints. Cross-check shapes against the backend DTOs / OpenAPI spec. Consolidated state: `../tap-platform/projectUpdate24June.md`.
>
> **Update 2026-06-25:** Artist/venue inspection responses now include `basicInfo.profilePicture` (string URL, resolved `cdnUrl → storageKey`; null when none). The artist/venue/artist-approval/venue-approval inspection pages render this avatar next to the name.

> **Source of truth for every field the admin UI reads, renders, sends, or filters on.**
> Generated from full static analysis of `src/`. All dummy-data shapes represent what the real API **must** return.

---

## Table of Contents

1. [Shared Types](#1-shared-types)
2. [Dashboard (Overview)](#2-dashboard-overview)
3. [User Management](#3-user-management)
4. [Artist Detail (Inspection)](#4-artist-detail-inspection)
5. [Artist Approval](#5-artist-approval)
6. [Venue Detail (Inspection)](#6-venue-detail-inspection)
7. [Venue Approval](#7-venue-approval)
8. [Message Moderation](#8-message-moderation)
9. [Content Moderation Queue](#9-content-moderation-queue)
10. [Activity Logs](#10-activity-logs)
11. [Resources Management](#11-resources-management)
12. [API Endpoint Summary](#12-api-endpoint-summary)
13. [React Query Hook Contracts](#13-react-query-hook-contracts)

---

## 1. Shared Types

Defined in `src/types/`.

### `User`
**File:** `src/types/user.ts`

```typescript
export interface User {
  id: string
  name: string
  email: string
  role: 'artist' | 'venue'
  joined: string          // human-readable date e.g. "Jan 14, 2026"
  lastlogin: string       // human-readable date e.g. "Jan 14, 2026"
  status: 'active' | 'not-approved' | 'suspended' | 'banned'
}
```

---

### `ActivityLog` / `EventType`
**File:** `src/types/logs.ts`

```typescript
export type EventType =
  | 'login'
  | 'logout'
  | 'approval'
  | 'name-change'
  | 'profile-update'
  | 'media-upload'
  | 'password-reset'
  | 'suspended'
  | 'banned'
  | 'other'

export interface ActivityLog {
  id: string
  userId: string
  time: Date              // ISO datetime string from API; parsed as Date on client
  event: EventType
  change: string          // plain-text description of what changed
  changeFrom?: string     // previous value (optional)
  changeTo?: string       // new value (optional)
}
```

---

### `Conversation` / `Message` / `Attachment`
**File:** `src/types/conversation.ts`

```typescript
export interface Attachment {
  id: string
  type: 'image' | 'video' | 'audio' | 'pdf' | 'document'
  name: string
  url: string
  size?: string           // human-readable e.g. "2.4 MB"
}

export interface Message {
  id: string
  senderId: string        // matches artist.id or venue.id in parent Conversation
  content: string
  timestamp: Date         // ISO datetime string from API; parsed as Date on client
  isRead?: boolean
  attachments?: Attachment[]
}

export interface Conversation {
  id: string
  artist: {
    id: string
    name: string
    avatar?: string       // used by MessageThread but absent in mock — include in API
  }
  venue: {
    id: string
    name: string
    avatar?: string       // used by MessageThread but absent in mock — include in API
  }
  messages: Message[]
}
```

---

### `Resource` / `ResourceType`
**File:** `src/types/resource.ts`

```typescript
export type ResourceType = 'youtube' | 'website' | 'document'

export interface Resource {
  id: string
  type: ResourceType
  title: string
  description: string
  url: string             // YouTube/website URL, or PDF file URL
  fileName?: string       // display name for document type
}
```

---

## 2. Dashboard (Overview)

**File:** `src/app/admin/page.tsx`

### UI Fields Rendered

| Field   | Type              | Notes                                     |
|---------|-------------------|-------------------------------------------|
| `title` | `string`          | Stat card label                           |
| `value` | `string`          | Formatted count e.g. `"1,284"`           |
| `icon`  | React component   | Lucide icon — UI only, not from API       |

### Hardcoded Dummy Data Shape

The four stat cards are fully hardcoded. When connected to a real API, the endpoint must return these four counts:

```typescript
interface DashboardStats {
  totalArtists: number            // rendered as "Artists"
  totalVenues: number             // rendered as "Venues"
  pendingArtistApprovals: number  // rendered as "Pending Artist Approvals"
  pendingVenueApprovals: number   // rendered as "Pending Venue Approvals"
}
```

### API Calls

None currently. Stat values are hardcoded strings.

---

## 3. User Management

**File:** `src/app/admin/users/page.tsx`
**Table component:** `src/components/admin/users/UserManagementTable.tsx`

### API Call

| Property        | Value                 |
|-----------------|-----------------------|
| Function        | `fetchAdminUsers()`   |
| Method          | `GET`                 |
| URL             | `/api/admin/users`    |
| Request body    | None                  |
| Response shape  | `User[]`              |

### UI Fields Rendered (per row)

| Field       | Type                                              | Notes                          |
|-------------|---------------------------------------------------|--------------------------------|
| `id`        | `string`                                          | Displayed in table             |
| `name`      | `string`                                          | Clickable — navigates to detail|
| `email`     | `string`                                          |                                |
| `role`      | `'artist' \| 'venue'`                             | Badge                          |
| `joined`    | `string`                                          |                                |
| `lastlogin` | `string`                                          |                                |
| `status`    | `'active' \| 'not-approved' \| 'suspended' \| 'banned'` | Badge + drives action buttons|

### Filter & Search Query State (client-side, no server params)

```typescript
search: string                                      // free-text search value
filter: 'name' | 'id' | 'email' | 'joined' | 'lastlogin'  // field to search on
roleFilter: 'artist' | 'venue'                      // tab selection
statusFilter: 'all' | 'active' | 'not-approved' | 'suspended' | 'banned'
currentPage: number                                 // 1-indexed
ITEMS_PER_PAGE: 50                                  // constant
```

### Action Buttons (by status)

| User Status     | Available Actions                |
|-----------------|----------------------------------|
| `active`        | Suspend, Ban                     |
| `not-approved`  | Approve, Reject                  |
| `suspended`     | Unsuspend, Ban                   |
| `banned`        | Unban                            |

Action button clicks are handled by a more-menu and individual row actions. The exact mutation payloads are not yet wired — see [Approval/Rejection payloads in §4 and §5](#5-artist-approval).

### Navigation

- Row click / name click → `getAdminUserRoute(user)` → artist or venue detail page
- More menu → `getAdminLogRoute(user)` → activity log filtered to user

---

## 4. Artist Detail (Inspection)

**File:** `src/app/admin/users/artist/[id]/page.tsx`

### API Call

| Property        | Value                         |
|-----------------|-------------------------------|
| Function        | `fetchAdminArtist(id: string)`|
| Method          | `GET`                         |
| URL             | `/api/admin/artist/:id`       |
| Path param      | `id: string`                  |
| Request body    | None                          |
| Response shape  | `Artist` (see below)          |

### Full `Artist` Interface (derived from `src/data_mock/artists.ts`)

```typescript
interface Artist {
  id: string

  basicInfo: {
    stageName: string
    profilePicture: string          // URL
    shortBio: string
    extendedBio: string
    location: {
      city: string
      regions: string[]
    } | string                      // mock has both shapes — normalise to object in API
    artistType: string
    openToTravel: boolean
    travelRadius: string            // e.g. "50km"
  }

  genres: {
    genres: string[]
    performanceType: string
    performanceStyle: string
    actType: string
    energyLevel: string
  }

  media: {
    images: string[]                // array of image URLs (empty in some mocks)
    videoUrl: string                // URL to embedded/linked video
    socialMedia: {
      instagram: string
      tiktok: string
      youtube: string
      facebook: string
      x: string
    }
  }

  photos: {
    images: Array<{ url: string }>
  }

  musicLinks: {
    links: Array<{
      id: string
      platform: string              // e.g. "Spotify", "SoundCloud"
      url: string
    }>
  }

  bookingInfo: {
    availability: string[]          // e.g. ["Weekends", "Weekdays"]
    feeRange: {
      min: string                   // e.g. "500"
      max: string                   // e.g. "2000"
      currency: string              // e.g. "AUD"
    }
    setLengths: string[]            // e.g. ["30 min", "1 hour"]
  }

  liveSetup: {
    setupType: string               // e.g. "Solo", "Band"
    equipment: string[]
    technicalNotes: string
  }
}
```

### Action Buttons

| Button           | Payload (not yet wired)                          |
|------------------|--------------------------------------------------|
| Suspend          | `{ artistId: string, action: 'suspend' }`        |
| Ban              | `{ artistId: string, action: 'ban' }`            |
| Reset Password   | `{ artistId: string, action: 'reset-password' }` |

---

## 5. Artist Approval

**File:** `src/app/admin/users/artistapproval/[id]/page.tsx`

### API Call (fetch)

Same as §4 — `GET /api/admin/artist/:id` → `Artist`

### Approval Form Fields

| Field      | Type     | Input type | Notes                               |
|------------|----------|------------|-------------------------------------|
| `feedback` | `string` | `textarea` | Placeholder: "Write feedback for the user..." |

### Action Button Payloads

Each button submits the feedback text along with the action:

```typescript
// Approve
interface ApproveArtistPayload {
  artistId: string
  action: 'approve'
  feedback: string
}

// Request Changes
interface RequestChangesArtistPayload {
  artistId: string
  action: 'request-changes'
  feedback: string
}

// Reject
interface RejectArtistPayload {
  artistId: string
  action: 'reject'
  feedback: string
}
```

Suggested single endpoint:

```
POST /api/admin/artist/:id/decision
Body: { action: 'approve' | 'request-changes' | 'reject', feedback: string }
```

---

## 6. Venue Detail (Inspection)

**File:** `src/app/admin/users/venue/[id]/page.tsx`

### API Call

| Property        | Value                         |
|-----------------|-------------------------------|
| Function        | `fetchAdminVenue(id: string)` |
| Method          | `GET`                         |
| URL             | `/api/admin/venue/:id`        |
| Path param      | `id: string`                  |
| Request body    | None                          |
| Response shape  | `Venue` (see below)           |

### Full `Venue` Interface (derived from `src/data_mock/venues.ts`)

```typescript
interface Venue {
  id: string

  venueDetails: {
    venueName: string
    address: string
    city: string
    state: string
    zipCode: string
    description: string
  }

  capacitySpecs: {
    capacity: number
    hasStage: boolean
    stageDimensions: string         // e.g. "8m x 5m"
    soundSystem: string[]           // e.g. ["PA System", "Monitors"]
    soundSystemNotes: string
    amenities: string[]             // e.g. ["Green Room", "Parking"]
  }

  photos: {
    images: Array<{ url: string }>
  }

  bookingPreferences: {
    eventTypes: string[]            // e.g. ["Live Music", "Corporate"]
    genres: string[]
    pricingModel: string            // e.g. "Per Event", "Hourly"
    minPrice: string                // e.g. "500"
    maxPrice: string                // e.g. "5000"
    bookingNotes: string
  }
}
```

### Action Buttons

| Button           | Payload (not yet wired)                        |
|------------------|------------------------------------------------|
| Suspend Venue    | `{ venueId: string, action: 'suspend' }`       |
| Ban Venue        | `{ venueId: string, action: 'ban' }`           |
| Reset Password   | `{ venueId: string, action: 'reset-password'}` |

---

## 7. Venue Approval

**File:** `src/app/admin/users/venueapproval/[id]/page.tsx`

### API Call (fetch)

Same as §6 — `GET /api/admin/venue/:id` → `Venue`

### Approval Form Fields

| Field      | Type     | Input type | Notes                               |
|------------|----------|------------|-------------------------------------|
| `feedback` | `string` | `textarea` | Placeholder: "Write feedback for the user..." |

### Action Button Payloads

```typescript
// Approve
interface ApproveVenuePayload {
  venueId: string
  action: 'approve'
  feedback: string
}

// Request Changes
interface RequestChangesVenuePayload {
  venueId: string
  action: 'request-changes'
  feedback: string
}

// Reject
interface RejectVenuePayload {
  venueId: string
  action: 'reject'
  feedback: string
}
```

Suggested single endpoint:

```
POST /api/admin/venue/:id/decision
Body: { action: 'approve' | 'request-changes' | 'reject', feedback: string }
```

---

## 8. Message Moderation

**File:** `src/app/admin/messages/page.tsx`
**Thread component:** `src/components/admin/messages/MessageThread.tsx`

### API Call

| Property        | Value                     |
|-----------------|---------------------------|
| Function        | `fetchAdminMessages()`    |
| Method          | `GET`                     |
| URL             | `/api/admin/messages`     |
| Request body    | None                      |
| Response shape  | `Conversation[]`          |

### UI Fields Rendered

**Conversation list panel:**

| Field                          | Type     | Notes                             |
|--------------------------------|----------|-----------------------------------|
| `conversation.id`              | `string` |                                   |
| `conversation.artist.name`     | `string` |                                   |
| `conversation.venue.name`      | `string` |                                   |
| `conversation.messages` (last) | `Message`| Preview of last message + timestamp|

**Message thread panel (per message):**

| Field                     | Type                                          | Notes                        |
|---------------------------|-----------------------------------------------|------------------------------|
| `message.id`              | `string`                                      |                              |
| `message.senderId`        | `string`                                      | Determines left/right bubble |
| `message.content`         | `string`                                      | Message body text            |
| `message.timestamp`       | `Date`                                        | Formatted for display        |
| `message.isRead`          | `boolean \| undefined`                        |                              |
| `message.attachments`     | `Attachment[] \| undefined`                   |                              |
| `attachment.id`           | `string`                                      |                              |
| `attachment.type`         | `'image' \| 'video' \| 'audio' \| 'pdf' \| 'document'` | Drives rendering |
| `attachment.name`         | `string`                                      | File display name            |
| `attachment.url`          | `string`                                      | Direct link/src              |
| `attachment.size`         | `string \| undefined`                         | e.g. `"2.4 MB"`             |

### Filter & Search (client-side)

```typescript
search: string                          // free-text input value
searchFilter: 'all' | 'artist' | 'venue'  // dropdown selection

// Filtering logic:
// if searchFilter === 'artist' → match conversation.artist.name
// if searchFilter === 'venue'  → match conversation.venue.name
// else                         → match either name

// Sort: conversations sorted by messages[last].timestamp descending
```

### `MessageThread` Component Props

```typescript
type MessageThreadProps = {
  conversation: {
    id: string
    artist: { id: string; name: string; avatar?: string }
    venue:  { id: string; name: string; avatar?: string }
    messages: Message[]
  }
}
```

> **Note:** `avatar` is used in the component but absent from the Conversation mock. The API should include it.

---

## 9. Content Moderation Queue

**File:** `src/app/admin/moderation/page.tsx`
**Table component:** `src/components/admin/moderation/ModerationQueueTable.tsx`
**Preview dialog:** `src/components/admin/moderation/ModerationPreviewDialog.tsx`

### API Call

| Property        | Value                       |
|-----------------|-----------------------------|
| Function        | `fetchModerationQueue()`    |
| Method          | `GET`                       |
| URL             | `/api/admin/moderation`     |
| Request body    | None                        |
| Response shape  | `ModerationItem[]`          |

### `ModerationItem` Interface

```typescript
interface ModerationItem {
  id: string
  userId: string
  name: string                    // display name of the user who uploaded
  type: 'images' | 'video'
  role: 'artist' | 'venue'
  date: string                    // format: "YYYY-MM-DD"
  content: string                 // URL to the image or video to preview
}
```

### UI Fields Rendered (table columns)

| Field         | Type                   | Notes             |
|---------------|------------------------|-------------------|
| `item.userId` | `string`               | "User ID" column  |
| `item.name`   | `string`               | "Name" column     |
| `item.type`   | `'images' \| 'video'`  | "Type" column     |
| `item.date`   | `string`               | "Date" column     |

### Filter Controls (client-side)

```typescript
roleFilter: 'artist' | 'venue'          // default: 'artist'
typeFilter: 'all' | 'images' | 'video'  // default: 'all'

// Filtering logic:
// matchesRole = roleFilter === 'all' ? true : item.role === roleFilter
// matchesType = typeFilter === 'all' ? true : item.type === typeFilter
```

### Action Payloads

```typescript
// Approve content item
interface ApproveModerationPayload {
  id: string   // ModerationItem.id
}
// → onApprove(id: string)

// Reject content item
interface RejectModerationPayload {
  id: string   // ModerationItem.id
}
// → onReject(id: string)
```

Suggested endpoints:
```
POST /api/admin/moderation/:id/approve
POST /api/admin/moderation/:id/reject
```

### `ModerationPreviewDialog` Props

```typescript
interface ModerationPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ModerationItem | null
  onApprove: (id: string) => void
  onReject: (id: string) => void
}
```

The dialog renders `item.content` (URL) as either an `<img>` or `<video>` depending on `item.type`.

---

## 10. Activity Logs

**File:** `src/app/admin/log/page.tsx`

### API Call

| Property        | Value                  |
|-----------------|------------------------|
| Function        | `fetchAdminLogs()`     |
| Method          | `GET`                  |
| URL             | `/api/admin/logs`      |
| Request body    | None                   |
| Response shape  | `ActivityLog[]`        |

### UI Fields Rendered (table columns)

| Field              | Type          | Notes                                        |
|--------------------|---------------|----------------------------------------------|
| `log.id`           | `string`      | Key only                                     |
| `log.userId`       | `string`      |                                              |
| `log.time`         | `Date`        | Formatted as `"yyyy-MM-dd HH:mm"`           |
| `log.event`        | `EventType`   | Displayed with `-` replaced by ` `           |
| `log.change`       | `string`      | Plain description                            |
| `log.changeFrom`   | `string?`     | "Previous" value in expandable diff row      |
| `log.changeTo`     | `string?`     | "New" value in expandable diff row           |

### Change Diff Display Logic

```
if (changeFrom && changeTo) → show "changeFrom → changeTo"
if (changeFrom only)        → show "changeFrom removed"
if (changeTo only)          → show "changeTo added"
```

### Filter/Search

No server-side filter params documented in the current implementation. Filtering (if any) is client-side.

---

## 11. Resources Management

**File:** `src/app/admin/resources/page.tsx`
**Create dialog:** `src/components/admin/resources/CreateResourceDialog.tsx`
**View/Edit dialog:** `src/components/admin/resources/ViewResourceDialog.tsx`

### API Call (fetch)

| Property        | Value                   |
|-----------------|-------------------------|
| Function        | `fetchResources()`      |
| Method          | `GET`                   |
| URL             | `/api/admin/resources`  |
| Request body    | None                    |
| Response shape  | `Resource[]`            |

### UI Fields Rendered (table columns)

| Field               | Type           | Notes               |
|---------------------|----------------|---------------------|
| `resource.id`       | `string`       | Key only            |
| `resource.type`     | `ResourceType` | "Type" column       |
| `resource.title`    | `string`       | "Title" column      |

### Drag-and-Drop Reorder

User can reorder resources via dnd-kit. This likely requires a reorder endpoint:

```typescript
// Suggested payload
POST /api/admin/resources/reorder
Body: { orderedIds: string[] }
```

### Create Resource Form

**Fields:**

| Field         | Type                                   | Input type   | Condition                  |
|---------------|----------------------------------------|--------------|----------------------------|
| `type`        | `'youtube' \| 'website' \| 'document'`| select/tabs  | Always visible             |
| `title`       | `string`                               | text input   | Always visible             |
| `description` | `string`                               | textarea     | Always visible             |
| `url`         | `string`                               | text input   | Only for `youtube`/`website`|
| `pdfFile`     | `File \| null`                         | file input   | Only for `document`         |

**Create Payload:**

```typescript
// For youtube or website:
interface CreateYouTubeOrWebsitePayload {
  type: 'youtube' | 'website'
  title: string
  description: string
  url: string
}

// For document:
interface CreateDocumentPayload {
  type: 'document'
  title: string
  description: string
  pdfFile: File           // multipart/form-data upload
}
```

Suggested endpoint:
```
POST /api/admin/resources
Content-Type: application/json  (for youtube/website)
Content-Type: multipart/form-data  (for document)
Response: Resource
```

### View / Edit Resource Form

**Component Props:**
```typescript
interface ViewResourceDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  resource: {
    id: string
    type: ResourceType
    title: string
    description: string
    url?: string
    fileName?: string
  }
}
```

**Editable fields:**

| Field         | Type           |
|---------------|----------------|
| `type`        | `ResourceType` |
| `title`       | `string`       |
| `description` | `string`       |
| `url`         | `string`       |

**Save Payload:**

```typescript
interface UpdateResourcePayload {
  type: ResourceType
  title: string
  description: string
  url: string
}
```

Suggested endpoint:
```
PATCH /api/admin/resources/:id
Body: UpdateResourcePayload
Response: Resource
```

**Preview rendering by type:**

| Type       | Preview                                          |
|------------|--------------------------------------------------|
| `youtube`  | `<iframe>` with extracted YouTube video ID       |
| `website`  | External link (opens in new tab)                 |
| `document` | Text label showing `resource.fileName`           |

---

## 12. API Endpoint Summary

| Method | URL                              | Request Body                            | Response              |
|--------|----------------------------------|-----------------------------------------|-----------------------|
| GET    | `/api/admin/users`               | —                                       | `User[]`              |
| GET    | `/api/admin/artist/:id`          | —                                       | `Artist`              |
| POST   | `/api/admin/artist/:id/decision` | `{ action, feedback }`                  | `Artist` or `{ ok }`  |
| GET    | `/api/admin/venue/:id`           | —                                       | `Venue`               |
| POST   | `/api/admin/venue/:id/decision`  | `{ action, feedback }`                  | `Venue` or `{ ok }`   |
| GET    | `/api/admin/messages`            | —                                       | `Conversation[]`      |
| GET    | `/api/admin/logs`                | —                                       | `ActivityLog[]`       |
| GET    | `/api/admin/moderation`          | —                                       | `ModerationItem[]`    |
| POST   | `/api/admin/moderation/:id/approve` | —                                    | `{ ok }`              |
| POST   | `/api/admin/moderation/:id/reject`  | —                                    | `{ ok }`              |
| GET    | `/api/admin/resources`           | —                                       | `Resource[]`          |
| POST   | `/api/admin/resources`           | `CreatePayload` (see §11)               | `Resource`            |
| PATCH  | `/api/admin/resources/:id`       | `UpdateResourcePayload`                 | `Resource`            |
| POST   | `/api/admin/resources/reorder`   | `{ orderedIds: string[] }`              | `{ ok }`              |

> **Dashboard stats endpoint not yet defined** — the UI needs `GET /api/admin/stats` → `DashboardStats`.

---

## 13. React Query Hook Contracts

All hooks use `@tanstack/react-query`.

```typescript
// Users
queryKey:  ['admin-users']
queryFn:   fetchAdminUsers          // GET /api/admin/users
staleTime: 2 * 60 * 1000           // 2 minutes
returns:   User[]

// Artist detail
queryKey:  ['admin-artist', id]
queryFn:   () => fetchAdminArtist(id)  // GET /api/admin/artist/:id
enabled:   !!id
returns:   Artist

// Venue detail
queryKey:  ['admin-venue', id]
queryFn:   () => fetchAdminVenue(id)   // GET /api/admin/venue/:id
enabled:   !!id
returns:   Venue

// Messages
queryKey:  ['admin-messages']
queryFn:   fetchAdminMessages       // GET /api/admin/messages
returns:   Conversation[]

// Activity logs
queryKey:  ['admin-logs']
queryFn:   fetchAdminLogs           // GET /api/admin/logs
returns:   ActivityLog[]

// Moderation queue
queryKey:  ['moderation-queue']
queryFn:   fetchModerationQueue     // GET /api/admin/moderation
returns:   ModerationItem[]

// Resources
queryKey:  ['admin-resources']
queryFn:   fetchResources           // GET /api/admin/resources
returns:   Resource[]
```
