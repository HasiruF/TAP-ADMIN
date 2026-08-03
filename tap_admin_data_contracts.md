# TAP Admin — Data Contracts

> Last verified: 2026-07-31, against the working tree.
> **Source of truth for every field the admin UI reads, renders, sends, or filters on**, drawn from actual usage in `src/`. There is no server-side BFF — every endpoint below is a real TAP backend route called directly from the browser via `NEXT_PUBLIC_API_URL` (see [tap_admin_project_structure.md](tap_admin_project_structure.md) §3). Nothing here is proxied through a Next.js API route except `/api/health`.
>
> **No formal `Artist`/`Venue` response type exists in the codebase.** `fetchAdminArtist()` / `fetchAdminVenue()` return whatever `api()` parses (untyped `JSON.parse` result); components consume fields ad hoc. The `Artist`/`Venue` shapes below are reconstructed from every `data.<field>` access found in `ArtistDetailClient.tsx` / `ArtistApprovalClient.tsx` / `VenueDetailClient.tsx` / `VenueApprovalClient.tsx` — treat them as "known-used fields," not a guaranteed exhaustive DTO.

---

## Table of Contents

1. [Shared Types](#1-shared-types)
2. [Dashboard (Overview)](#2-dashboard-overview)
3. [User Management](#3-user-management)
4. [Artist Detail (Inspection) / Approval](#4-artist-detail-inspection--approval)
5. [Venue Detail (Inspection) / Approval](#5-venue-detail-inspection--approval)
6. [Message Moderation](#6-message-moderation)
7. [Content Moderation Queue](#7-content-moderation-queue)
8. [Activity Logs](#8-activity-logs)
9. [Resources Management](#9-resources-management)
10. [Vendor Management (Marketplace)](#10-vendor-management-marketplace)
11. [API Endpoint Summary](#11-api-endpoint-summary)
12. [React Query Hook Contracts](#12-react-query-hook-contracts)

---

## 1. Shared Types

### `User` / `UserBe`
**File:** `src/types/user.ts`

`UserBe` is the raw backend shape; `mapUserToBe()` derives the UI-facing
`User` from it (note the function name is misleading — it maps *from*
`UserBe` *to* `User`, not the reverse).

```typescript
export interface UserBe {
  id: string
  email: string | null
  firstName: string | null
  lastName: string | null
  profileName: string | null       // artist stage name / venue name, if a profile exists
  role: { id: number; name: string }
  accountStatus: string            // ACTIVE | PENDING_VERIFICATION | SUSPENDED | ANONYMISED | LOCKED | DEACTIVATED
  deletedAt: string | null
  profileApprovalStatus: string | null   // DRAFT | PENDING_APPROVAL | APPROVED | REJECTED
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

export interface User {
  id: string
  name: string     // profileName → firstName+lastName → email → id, in that order
  email: string
  role: string
  status: string    // human-readable label, see mapUserToBe() below
  joined: string    // = createdAt
  lastLogin: string // = lastLoginAt ?? updatedAt
}
```

`status` derivation (in priority order): soft-deleted → `Deleted`;
`accountStatus` SUSPENDED/LOCKED/ANONYMISED/DEACTIVATED →
`Suspended`/`Locked`/`Banned`/`Deactivated`; `PENDING_VERIFICATION` →
`Not-approved`; else if a profile exists, `profileApprovalStatus` maps
DRAFT/REJECTED → `Inactive`, PENDING_APPROVAL → `Not-approved`, APPROVED →
`Active`; artist/venue with no profile yet → `Inactive`; anything else
(e.g. admin accounts) → `accountStatus` verbatim-mapped.

---

### `ActivityLog` / `EventType`
**File:** `src/types/logs.ts`

```typescript
export type EventType =
  | 'account-created' | 'go-live' | 'approval' | 'rejection'
  | 'profile-picture' | 'media-upload' | 'media-delete'
  | 'media-accepted' | 'media-rejected' | 'password-reset'
  | 'suspension' | 'account-deleted' | 'other'

export interface ActivityLog {
  id: string
  userId: string | null          // the entry's subject (target, falling back to actor)
  actorUserId?: string | null    // who performed the action
  actorName?: string | null
  actorEmail?: string | null
  actorRole?: string | null
  targetId?: string | null       // who the action was performed on
  targetName?: string | null
  targetEmail?: string | null
  time: string | Date
  event: EventType
  action?: string                // raw backend action code, e.g. ADMIN_APPROVED_USER
  change: string
  changeFrom?: string | null
  changeTo?: string | null
  metadata?: Record<string, unknown> | null
}
```

This is a materially different (richer, actor/target-aware) shape than the
older `EventType` union (`login | logout | approval | name-change | ...`) —
do not assume the two are interchangeable.

---

### `Resource` / `ResourceType`
**File:** `src/types/resource.ts`

```typescript
export type ResourceType = 'youtube' | 'website' | 'pdf'   // NOT 'document'

export interface Resource {
  id: string
  index: number             // sort position
  type: ResourceType
  title: string
  description: string | null
  url: string
  category: string | null
  thumbnailUrl: string | null
  createdAt?: string
  updatedAt?: string
}

/** Accepted by PUT /admin/resources (bulk replace). */
export interface ResourceItemInput {
  id?: string
  index: number
  type: ResourceType
  title: string
  description?: string
  url: string
  category?: string
  thumbnailUrl?: string
}
```

---

### Vendor types
**File:** `src/types/vendor.ts`

```typescript
export interface VendorCategory {
  id: string
  name: string
  slug: string
  parentCategory: VendorCategory | null   // self-referencing, one level of nesting used in the UI
  isActive: boolean
  sortOrder: number
}

export interface VendorListingLink {
  label: string   // one of Facebook | Instagram | LinkedIn | TikTok | X | Website (UI-enforced, not type-enforced)
  url: string
}

export interface VendorListing {
  id: string
  name: string
  category: VendorCategory
  bio: string | null
  links: VendorListingLink[]
  discountCode: string | null
  discountDescription: string | null
  isActive: boolean
  sortOrder: number
}

export type VendorPhotoType = 'LOGO' | 'HERO' | 'NORMAL'

export interface VendorListingPhoto {
  id: string
  vendorListing: { id: string }
  mediaAssetId: string
  photoUrl: string | null
  photoType: VendorPhotoType
  caption: string | null
  sortOrder: number
}
```

---

### `Authuser`
**File:** `src/types/authuser.ts`

```typescript
export type Authuser = {
  id: string
  name: string
  email: string
  role: 'admin' | 'artist' | 'venue'
}
```

---

### Conversation / Message — two different shapes coexist

There are **two, non-identical** sets of conversation/message types:

**UI-facing (`src/types/conversation.ts`)** — used by `MessageThread` props
after `MessagesClient` reshapes the raw responses:
```typescript
export interface Attachment {
  id: string; type: 'IMAGE' | 'PDF' | 'LINK'; name: string; url: string; size?: string
}
export interface Message {
  id: string; senderId: string; content: string; timestamp: string
  isRead?: boolean; isDeleted: boolean; attachments?: Attachment[]
}
export interface ConversationParticipant {
  id: string; role: 'artist' | 'venue' | 'user'; name: string; avatar?: string | null
}
export interface Conversation {
  id: string; participants: [ConversationParticipant, ConversationParticipant]; messages: Message[]
}
```

**Wire shapes (`src/lib/api/admin/messages.ts`, `conversations.ts`)** —
what the backend actually returns, before `MessagesClient` remaps field
names (`conversationId` → `id`, adds `content` from `message`, etc.):
```typescript
// GET /admin/conversations
interface Conversation { conversationId: string; participants: [Participant, Participant]; lastMessageAt: string | null }

// GET /admin/conversations/:id
interface ConversationThreadResponse {
  conversationId: string
  messages: Array<{
    senderId: string
    senderRole: 'artist' | 'venue' | 'user'
    message: string | null
    isDeleted: boolean
    timestamp: string
    attachments: Array<{ id: string; type: 'IMAGE' | 'PDF' | 'LINK'; url: string; name: string | null; previewUrl: string | null }>
  }>
}
```

---

## 2. Dashboard (Overview)

**File:** `src/app/admin/OverviewClient.tsx`

### API Call

| Property | Value |
|---|---|
| Function | `fetchAdminOverview()` |
| Method / URL | `GET /admin/overview` |
| Response shape | `AdminOverviewResponse` |

```typescript
interface AdminOverviewResponse {
  totArtists: number
  totVenues: number
  totPendingArtist: number
  totPendingVenue: number
}
```

Stat cards render `data?.totArtists` etc. (title-cased as "Artists",
"Venues", "Pending Artist Approvals", "Pending Venue Approvals"), `'...'`
while loading, `'0'` when the field is missing. **Not hardcoded** — this
supersedes older documentation.

### Analytics endpoints (`src/lib/api/admin/analytics.ts`)

```typescript
type UserGrowthRange = '7d' | '30d' | '3m'
interface UserGrowthPoint { date: string; artists: number; venues: number }
interface UserGrowthResponse {
  range: UserGrowthRange; from: string; to: string
  totals: { artists: number; venues: number }
  series: UserGrowthPoint[]
}
// GET /admin/analytics/user-growth?range=7d|30d|3m

interface GenreDistributionItem { genreId: string | null; genreName: string; count: number }
interface ArtistGenreDistributionResponse { totalArtists: number; items: GenreDistributionItem[] }
// GET /admin/analytics/artist-genres

interface LocationRegionCount { regionId: string; regionName: string; count: number }
interface LocationCityCount { cityId: string; cityName: string; count: number; regions: LocationRegionCount[] }
interface ArtistLocationDistributionResponse { totalArtists: number; unspecifiedCount: number; cities: LocationCityCount[] }
// GET /admin/analytics/artist-locations
```

All three poll every 30s (`REALTIME_POLL_MS`) rather than pushing over a
socket.

---

## 3. User Management

**File:** `src/components/admin/users/UserManagementTable.tsx`

### API Call

| Property | Value |
|---|---|
| Function | `fetchAdminUsers(page, role?)` |
| Method / URL | `GET /admin/users?page=&limit=50&role=` (role omitted when `'all'`) |
| Response | array mapped through `mapUserToBe()` per row (see §1) |

### Mutations

| Action | Function | Endpoint |
|---|---|---|
| Suspend | `suspendUser(id, reason)` | `POST /admin/user/suspend` `{ id, reason }` |
| Unsuspend | `unsuspendUser(id)` | `POST /admin/user/unsuspend` `{ id }` |
| Ban | `banUser(id, reason)` | `POST /admin/user/ban` `{ id, reason }` |
| Unlock | `unlockUser(id)` | `PATCH /admin/users/:id/unlock` |
| Approve (artist row) | `approveArtist(id)` | `POST /admin/user/approve` `{ id }` |
| Approve (venue row) | `approveVenue(id)` | `POST /admin/venue/approve` `{ id }` |
| Reset password | `forgotPassword(email)` | `POST /auth/forgot/password` `{ email }` |

### Filter/Search state (client-side, persisted to `sessionStorage`)

```typescript
search: string
filter: 'name' | 'email' | 'joined' | 'lastlogin'
roleFilter: 'artist' | 'venue'
statusFilter: 'all' | 'active' | 'not-approved' | 'inactive' | 'suspended' | 'locked' | 'banned' | 'deactivated' | 'deleted'
currentPage: number
```

### Navigation
- Row click → `getAdminUserRoute(user)` (`src/utils/AdminRoutes.ts`)
- ⋮ menu → `getAdminLogRoute(user)` → `/admin/log?userId=<id>&name=<name>`

---

## 4. Artist Detail (Inspection) / Approval

**Files:** `ArtistDetailClient.tsx`, `ArtistApprovalClient.tsx`

### API Call

| Property | Value |
|---|---|
| Function | `fetchAdminArtist(id)` |
| Method / URL | `GET /admin/artist/:id` |

### Known-used response fields (reconstructed from usage — see header note)

```typescript
{
  id: string
  email: string
  accountStatus: string          // e.g. ACTIVE, SUSPENDED, LOCKED, DEACTIVATED
  deletedAt: string | null
  hasProfile: boolean            // false → "No Profile Set Up" placeholder is shown instead of the full layout
  approvalStatus: string

  basicInfo: {
    profilePicture: string | null
    stageName: string
    artistType: string
    phoneNumber: string
    location: unknown             // rendered directly; shape not narrowed in the component
    shortBio: string
  }

  members: { numberOfMembers: number; memberNames: string[] }
  instruments: { instruments: string[] }

  genres: {
    genres: string[]
    performanceType: string
    actType: string
    energyLevel: string
  }

  media: {
    images: string[]
    livePerformance: unknown      // rendered conditionally; embed logic detects YouTube URLs
    socialMedia: Record<string, string>
  }

  bookingInfo: {
    startingFeeCents: number
    startingSetLengthMinutes: number
    performanceFee: unknown
    feeRange: unknown
    maxSetLengthMinutes: number
    feeNegotiable: boolean
    availability: string[]
    paymentPreferences: unknown
    setLengths: string[]
  }

  liveSetup: {
    setupType: string
    equipmentProvided: string[]
    equipmentRequired: string[]
    techRiderTags: string[]
    technicalNotes: string
  }

  releases: Array<{ /* split by splitReleases() into streaming-platform links vs. other releases */ }>
  pastGigs: Array<{ id: string; media?: string | null; venueName?: string | null; date?: string | null; testimonial?: string | null }>
}
```

### Mutations

| Action | Function | Endpoint |
|---|---|---|
| Approve | `approveArtist(id)` | `POST /admin/user/approve` `{ id }` |
| Reject | `rejectArtist(id, feedback)` | `POST /admin/user/reject` `{ id, feedback }` |
| Suspend | `suspendUser(id, reason)` | `POST /admin/user/suspend` |
| Unsuspend | `unsuspendUser(id)` | `POST /admin/user/unsuspend` |
| Unlock | `unlockUser(id)` | `PATCH /admin/users/:id/unlock` |
| Reset password | `forgotPassword(email)` | `POST /auth/forgot/password` |
| Mint preview link | `mintArtistPreviewLink(id)` | `POST /admin/artist/:id/preview-token` → `{ url }` |

`requestArtistChanges(id, feedback)` (`POST /admin/user/req-changes`) exists
in `src/lib/api/admin/artists.ts` but is **not called from any component** —
there is no "Request Changes" UI action currently wired up.

### Approval feedback (controlled input, not uncontrolled as in older docs)

```typescript
feedback: string   // required (validated client-side) before Reject is allowed; sent verbatim as rejectArtist's second arg
```

---

## 5. Venue Detail (Inspection) / Approval

**Files:** `VenueDetailClient.tsx`, `VenueApprovalClient.tsx`

### API Call

| Property | Value |
|---|---|
| Function | `fetchAdminVenue(id)` |
| Method / URL | `GET /admin/venue/:id` |

### Known-used response fields

```typescript
{
  id: string
  email: string
  accountStatus: string
  deletedAt: string | null
  slug: string | null              // used to build the public profile URL
  marketplaceUnlocked: boolean     // gates the "View Live Profile" button
  regions: string[]
  regionSuggestions: Array<{ id: string; cityName: string; suggestedName: string; dismissed: boolean; resolved: boolean }>
  preferredDays: string[]

  venueDetails: {
    profilePicture: string | null
    venueName: string
    venueType: string
    address: string; city: string; state: string; zipCode: string
    phoneNumber: string
    website: string
    description: string
    licenseName: string
    licenseNumber: string
    socialMedia: Record<string, string>
  }

  capacitySpecs: {
    capacity: number
    hasStage: boolean
    stageSize: string
    stageDimensions: string
    stageAreaType: string
    soundSystem: string[]
    soundSystemNotes: string
    fullBandSupport: boolean
    audioMixersAvailable: boolean
    soundEngineerAvailable: boolean
    productionTeamAvailable: boolean
    equipmentProvided: string[]
    amenities: string[]
  }

  venueHistory: Array<{ id: string; media?: string | null; performanceName?: string | null; eventDescription?: string | null }>

  bookingPreferences: {
    eventTypes: string[]
    genresOpenToAll: boolean
    genres: string[]
    audienceDemographics: unknown
    averageAudienceSize: unknown
    startingFeeCents: number
    startingSetLengthMinutes: number
    maxSetLengthMinutes: number
    paymentPreferences: unknown
    bookingLeadTime: unknown
    bookingNotes: string
  }

  photos: { images: unknown; videos: unknown }
}
```

### Mutations

| Action | Function | Endpoint |
|---|---|---|
| Approve | `approveVenue(id)` | `POST /admin/venue/approve` `{ id }` |
| Reject | `rejectVenue(id, feedback)` | `POST /admin/venue/reject` `{ id, feedback }` |
| Suspend | `suspendUser(id, reason)` | `POST /admin/user/suspend` |
| Unsuspend | `unsuspendUser(id)` | `POST /admin/user/unsuspend` |
| Reset password | `forgotPassword(email)` | `POST /auth/forgot/password` |
| Add region suggestion | `addRegionSuggestion(suggestionId)` | `POST /admin/venue/region-suggestions/add` `{ id }` |
| Dismiss region suggestion | `dismissRegionSuggestion(suggestionId)` | `POST /admin/venue/region-suggestions/dismiss` `{ id }` |

The "Show Preview" button is now
`window.open(`${NEXT_PUBLIC_PLATFORM_URL}/venues/${data.slug}`)`, disabled
unless `data.slug && data.marketplaceUnlocked` — not a call to any
preview-token endpoint (that pattern is artist-only).

---

## 6. Message Moderation

**Files:** `MessagesClient.tsx`, `MessageThread.tsx`, `src/lib/api/admin/messages.ts`, `conversations.ts`

### API Calls

| Property | Value |
|---|---|
| List | `fetchAdminConversations(filters?)` → `GET /admin/conversations?id=&artistId=&venueId=` → `Conversation[]` (`conversationId`, `participants`, `lastMessageAt`) |
| Thread | `fetchConversationThread(id)` → `GET /admin/conversations/:id` → `ConversationThreadResponse` |

See §1 for the full wire shapes and how `MessagesClient` remaps them into
the UI-facing `Conversation`/`Message` types before handing them to
`MessageThread`.

### Filter/Search (client-side)
```typescript
search: string
searchFilter: 'all' | 'artist' | 'venue'
// sorted by participants[].role match, then by lastMessageAt descending
```

Read-only screen — no send/moderate mutation exists for messages.

---

## 7. Content Moderation Queue

**Files:** `ModerationClient.tsx`, `ModerationQueueTable.tsx`, `ModerationPreviewDialog.tsx`, `RejectReasonDialog.tsx`, `src/lib/api/admin/moderation.ts`

### API Call

| Property | Value |
|---|---|
| Function | `fetchModerationQueue()` |
| Method / URL | `GET /admin/moderation` |
| Response | `ModerationItem[]` |

```typescript
interface ModerationItem {
  contentModId: string
  userId: string | null
  email: string | null
  name: string | null
  type: 'images' | 'video' | string
  role: 'artist' | 'venue' | string | null
  reason: string
  date: string
  contentLink: string | null   // absolute URL or a relative backend storage path
}
```

`resolveContentUrl(contentLink)` prefixes relative links with
`NEXT_PUBLIC_API_URL` (with the `/api/v1` suffix stripped) to produce a
loadable URL.

### Mutations

| Action | Function | Endpoint |
|---|---|---|
| Approve | `approveModeration(contentModId)` | `POST /admin/moderation/approve` `{ contentModId }` |
| Reject | `rejectModeration({ contentModId, reviewNotes })` | `POST /admin/moderation/reject` `{ contentModId, reviewNotes }` |

`reviewNotes` is required — `RejectReasonDialog` blocks submission until
non-empty. Both mutations are wired through `useModerationActions()`, which
invalidates `['moderation-queue']` on success and toasts a generic error
message on failure.

### Filter Controls (client-side)
```typescript
roleFilter: 'artist' | 'venue' | 'all'   // default 'artist'
typeFilter: 'all' | 'images' | 'video'   // default 'all'
```

---

## 8. Activity Logs

**File:** `LogClient.tsx`

### API Call

| Property | Value |
|---|---|
| Function | `fetchAdminLogs(userId?)` |
| Method / URL | `GET /admin/logs?userId=` (param omitted for the global feed) |
| Response | `ActivityLog[]` (see §1) |

### Route params (read via `useSearchParams()`, not a dynamic `[id]` segment)
```
/admin/log                         → all activity, "All Activity" heading
/admin/log?userId=<id>&name=<name> → that user's activity, heading = name
```
Set by `getAdminLogRoute(user)` in `src/utils/AdminRoutes.ts`.

### Client-side search
Filters across `targetEmail`, `actorEmail`, `targetName`, `actorName`,
`event`, `action`, `change`.

### Change diff display
```
changeFrom && changeTo → "changeFrom → changeTo"
changeFrom only        → shown as a "removed" pill
changeTo only           → shown as an "added" pill
```
An additional "· by {actorName}" suffix appears when `actorUserId !==
targetId` (an admin or another party acted on this account).

---

## 9. Resources Management

**Files:** `ResourcesClient.tsx`, `CreateResourceDialog.tsx`, `ViewResourceDialog.tsx`, `src/lib/api/admin/resources.ts`

### API Calls

| Property | Value |
|---|---|
| List | `fetchResources()` → `GET /admin/resources` → `Resource[]` |
| Bulk save/reorder | `updateResources(items: ResourceItemInput[])` → `PUT /admin/resources` `{ items }` → `{ message: string }` |

There is no separate create/update/delete/reorder endpoint — Create, Edit,
and drag-reorder all funnel through the same bulk `PUT`, with the client
rebuilding the full ordered `ResourceItemInput[]` (via
`toResourceItemInput()`) each time.

### Create/Edit form fields
```typescript
type: 'youtube' | 'website' | 'pdf'   // NOT 'document'
title: string
description: string
category: string
url: string            // for youtube/website
pdfFile?: File          // for pdf, uploaded via uploadMedia() before save
thumbnailFile?: File    // optional, compressed client-side (compressImage()) then uploaded via uploadMedia()
```
Validated with `resourceSchema.ts` (zod) through react-hook-form.

> **Known inconsistency:** two `useUpdateResources()` hooks exist —
> `src/hooks/queries/useResources.ts` (invalidates `['admin-resources']`)
> and `src/hooks/queries/useUpdateResources.ts` (invalidates
> `['resources']`). `ResourcesClient.tsx` imports the one from
> `useResources.ts`; its own list query key is `['resources']`, so that
> hook's invalidation of `['admin-resources']` doesn't actually refetch the
> list — the page relies on the query's own `refetch()` after a save
> instead. `useUpdateResources.ts` appears to be unused dead code.

---

## 10. Vendor Management (Marketplace)

**Files:** `VendorsClient.tsx`, `CategoriesTable.tsx`, `CategoryDialog.tsx`, `ListingsTable.tsx`, `ListingDialog.tsx`

### Categories

| Property | Value |
|---|---|
| List | `fetchVendorCategories()` → `GET /vendors/categories?limit=100` → paginated `{ data: VendorCategory[], hasNextPage }`, unwrapped to `VendorCategory[]` |
| Create | `createVendorCategory(input)` → `POST /vendors/categories` |
| Update | `updateVendorCategory(id, input)` → `PATCH /vendors/categories/:id` |
| Delete | `deleteVendorCategory(id)` → `DELETE /vendors/categories/:id` |

```typescript
interface VendorCategoryInput {
  name: string; slug: string
  parentCategory?: { id: string } | null
  isActive: boolean; sortOrder: number
}
```

### Listings

| Property | Value |
|---|---|
| List | `fetchVendorListings()` → `GET /vendors/listings?limit=100` → unwrapped `VendorListing[]` |
| Create | `createVendorListing(input)` → `POST /vendors/listings` |
| Update | `updateVendorListing(id, input)` → `PATCH /vendors/listings/:id` |
| Delete | `deleteVendorListing(id)` → `DELETE /vendors/listings/:id` |

```typescript
interface VendorListingInput {
  name: string; category: { id: string }
  bio?: string | null; links?: VendorListingLink[]
  discountCode?: string | null; discountDescription?: string | null
  isActive: boolean; sortOrder: number
}
```

### Listing photos (up to `MAX_PHOTOS = 5` per listing in the UI)

| Property | Value |
|---|---|
| List | `fetchVendorListingPhotos(vendorListingId)` → `GET /vendors/listing-photos?vendorListingId=&limit=50` |
| Upload asset | `uploadMediaAsset(file)` → multipart `POST /media-assets/upload` → `{ id, photoUrl }` |
| Attach photo | `createVendorListingPhoto(input)` → `POST /vendors/listing-photos` |
| Delete | `deleteVendorListingPhoto(id)` → `DELETE /vendors/listing-photos/:id` |

```typescript
interface VendorListingPhotoInput {
  vendorListing: { id: string }
  mediaAssetId: string
  photoType: 'LOGO' | 'HERO' | 'NORMAL'
  sortOrder: number
  caption?: string | null
}
```

**All vendor endpoints live under `/vendors/*`, not `/admin/vendors/*`.**

---

## 11. API Endpoint Summary

| Method | URL | Body | Notes |
|---|---|---|---|
| POST | `/auth/email/login` | `{ email, password }` | non-admin roles rejected client-side |
| GET | `/auth/me` | — | hydrates session on load |
| POST | `/auth/refresh` | (Bearer = refresh token) | |
| POST | `/auth/logout` | — | |
| POST | `/auth/forgot/password` | `{ email }` | admin-triggered reset |
| GET | `/admin/overview` | — | dashboard stat cards |
| GET | `/admin/analytics/user-growth` | `?range=` | |
| GET | `/admin/analytics/artist-genres` | — | |
| GET | `/admin/analytics/artist-locations` | — | |
| GET | `/admin/users` | `?page=&limit=&role=` | |
| POST | `/admin/user/approve` | `{ id }` | artist approval |
| POST | `/admin/user/reject` | `{ id, feedback }` | |
| POST | `/admin/user/req-changes` | `{ id, feedback }` | defined, unused by any component |
| POST | `/admin/user/suspend` | `{ id, reason }` | |
| POST | `/admin/user/unsuspend` | `{ id }` | |
| POST | `/admin/user/ban` | `{ id, reason }` | |
| PATCH | `/admin/users/:id/unlock` | — | |
| GET | `/admin/artist/:id` | — | |
| POST | `/admin/artist/:id/preview-token` | — | mints a one-time preview link |
| GET | `/admin/venue/:id` | — | |
| POST | `/admin/venue/approve` | `{ id }` | |
| POST | `/admin/venue/reject` | `{ id, feedback }` | |
| POST | `/admin/venue/region-suggestions/add` | `{ id }` | |
| POST | `/admin/venue/region-suggestions/dismiss` | `{ id }` | |
| GET | `/admin/conversations` | `?id=&artistId=&venueId=` | |
| GET | `/admin/conversations/:id` | — | thread |
| GET | `/admin/moderation` | — | |
| POST | `/admin/moderation/approve` | `{ contentModId }` | |
| POST | `/admin/moderation/reject` | `{ contentModId, reviewNotes }` | |
| GET | `/admin/logs` | `?userId=` | |
| GET | `/admin/resources` | — | |
| PUT | `/admin/resources` | `{ items: ResourceItemInput[] }` | bulk create/update/reorder |
| GET | `/vendors/categories` | `?limit=` | |
| POST/PATCH/DELETE | `/vendors/categories[/:id]` | | |
| GET | `/vendors/listings` | `?limit=` | |
| POST/PATCH/DELETE | `/vendors/listings[/:id]` | | |
| GET | `/vendors/listing-photos` | `?vendorListingId=&limit=` | |
| POST/DELETE | `/vendors/listing-photos[/:id]` | | |
| POST | `/media-assets/upload` | multipart `file` | vendor listing photos |
| POST | `/files/upload` | multipart `file` | resource PDFs/thumbnails |
| GET | `/api/health` | — | **local** Next.js route, not a backend call |

---

## 12. React Query Hook Contracts

All hooks use `@tanstack/react-query` and are gated on
`!useAuthContext().isLoading` so nothing fires before session restore
completes.

```typescript
// Overview + analytics
['admin-overview']                          → fetchAdminOverview
['admin-analytics','user-growth',range]     → fetchUserGrowth(range)        // poll 30s
['admin-analytics','artist-genres']         → fetchArtistGenreDistribution  // poll 30s
['admin-analytics','artist-locations']      → fetchArtistLocationDistribution // poll 30s

// Users
['admin-users', page, role]  → fetchAdminUsers(page, role)

// Artist / Venue detail
['admin-artist', id]  → fetchAdminArtist(id)   // enabled: !!id
['admin-venue', id]   → fetchAdminVenue(id)    // enabled: !!id

// Messages
['admin-conversations', filters]  → fetchAdminConversations(filters)  // staleTime 2min, poll 15s
['conversation-thread', id]       → fetchConversationThread(id)       // poll 15s, enabled: !!id

// Activity logs
['admin-logs', userId ?? 'all']  → fetchAdminLogs(userId)

// Moderation
['moderation-queue']  → fetchModerationQueue   // select: res ?? []

// Resources
['resources']  → fetchResources         // staleTime 5min
                  useUpdateResources()  → updateResources (PUT, bulk)

// Vendors
['vendor-categories']            → fetchVendorCategories        // staleTime 5min
['vendor-listings']              → fetchVendorListings           // staleTime 5min
['vendor-listing-photos', id]    → fetchVendorListingPhotos(id)  // enabled: !!id

// Auth
['me']  → authApi.me   // retry: false
```
