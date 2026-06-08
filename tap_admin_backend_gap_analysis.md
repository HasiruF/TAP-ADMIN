# TAP Admin — Backend Endpoint Gap Analysis

> **Generated:** 2026-06-03  
> **Source:** Full static analysis of `tap-admin` (Next.js BFF + mock API routes) and `tap-backend` (NestJS source).  
> All NestJS endpoints are versioned under `/v1/` and protected by JWT unless noted.  
> The tap-admin Next.js app has its own thin `/api/admin/*` BFF routes that today serve mock data — when connected to the real backend, each BFF route will proxy to the corresponding NestJS endpoint listed below.

---

## Table of Contents

1. [Auth Convention](#1-auth-convention)
2. [Endpoint Specifications](#2-endpoint-specifications)
   - 2.1 [Auth — Admin Login](#21-auth--admin-login)
   - 2.2 [Dashboard Stats](#22-dashboard-stats)
   - 2.3 [User List](#23-user-list)
   - 2.4 [Get Artist Profile (Admin)](#24-get-artist-profile-admin)
   - 2.5 [Artist Approval Decision](#25-artist-approval-decision)
   - 2.6 [Artist Status Action (Suspend / Ban / Unsuspend / Unban)](#26-artist-status-action-suspend--ban--unsuspend--unban)
   - 2.7 [Artist Password Reset (Admin-triggered)](#27-artist-password-reset-admin-triggered)
   - 2.8 [Get Venue Profile (Admin)](#28-get-venue-profile-admin)
   - 2.9 [Venue Approval Decision](#29-venue-approval-decision)
   - 2.10 [Venue Status Action (Suspend / Ban / Unsuspend / Unban)](#210-venue-status-action-suspend--ban--unsuspend--unban)
   - 2.11 [Venue Password Reset (Admin-triggered)](#211-venue-password-reset-admin-triggered)
   - 2.12 [Quick Status Actions on User Management Table](#212-quick-status-actions-on-user-management-table)
   - 2.13 [Content Moderation Queue](#213-content-moderation-queue)
   - 2.14 [Moderation Item — Approve](#214-moderation-item--approve)
   - 2.15 [Moderation Item — Reject](#215-moderation-item--reject)
   - 2.16 [Admin Message Conversations List](#216-admin-message-conversations-list)
   - 2.17 [Activity Logs for a User](#217-activity-logs-for-a-user)
   - 2.18 [Resources — List](#218-resources--list)
   - 2.19 [Resources — Create](#219-resources--create)
   - 2.20 [Resources — Update](#220-resources--update)
   - 2.21 [Resources — Delete](#221-resources--delete)
   - 2.22 [Resources — Reorder](#222-resources--reorder)
3. [Gap Analysis](#3-gap-analysis)
   - 3.1 [Full Endpoint Checklist](#31-full-endpoint-checklist)
   - 3.2 [Missing DB Tables](#32-missing-db-tables)
   - 3.3 [Status Enum Mismatches](#33-status-enum-mismatches)
   - 3.4 [Cross-cutting Concerns](#34-cross-cutting-concerns)

---

## 1. Auth Convention

Every endpoint in section 2 requires an **admin JWT bearer token** unless explicitly marked `PUBLIC`.

```
Authorization: Bearer <admin-jwt-token>
```

NestJS guard stack applied to all admin endpoints:
```typescript
@ApiBearerAuth()
@Roles(RoleEnum.admin)   // RoleEnum.admin = 1
@UseGuards(AuthGuard('jwt'), RolesGuard)
```

**Every mutation endpoint must also write an `AUDIT_LOG` row** (via the existing `insertAuditLog()` helper at `src/admin/infrastructure/persistence/relational/queries/audit-log.queries.ts`). This is a fire-and-forget call that must never surface errors to callers.

---

## 2. Endpoint Specifications

---

### 2.1 Auth — Admin Login

**Method + path:** `POST /v1/auth/email/login`  
**Auth:** None (public)

This endpoint already exists in `AuthController`. The tap-admin login page currently does a mock redirect. Wiring the real login requires no new backend work — the frontend just needs to call the existing endpoint.

**Request body (existing DTO):**
```typescript
{
  email: string     // admin user email
  password: string  // plaintext, hashed server-side with argon2id
}
```

**Response body:**
```typescript
{
  token: string        // JWT access token
  refreshToken: string
  tokenExpires: number // Unix epoch ms
  user: {
    id: string
    email: string | null
    firstName: string | null
    lastName: string | null
    role: { id: number; name: string }
    status: { id: number; name: string }
  }
}
```

**DB tables read:** `users`, `sessions`  
**Business logic:** Standard auth flow. If `user.role.id !== 1` (admin), return 403. The existing JWT guard enforces this on all subsequent requests.

---

### 2.2 Dashboard Stats

**Method + path:** `GET /v1/admin/stats`  
**Auth:** Admin JWT guard

**Query parameters:** None

**Request body:** None

**Response body:**
```typescript
{
  totalArtists: number             // COUNT of users with role = artist
  totalVenues: number              // COUNT of users with role = venue
  pendingArtistApprovals: number   // COUNT of artist_profiles with approval_status = 'PENDING_APPROVAL'
  pendingVenueApprovals: number    // COUNT of venue_profiles with approval_status = 'PENDING_APPROVAL' (or equivalent)
}
```

**DB tables read:** `users`, `artist_profiles`, `venue_profiles`  
**Business logic:**
- Count artists: `SELECT COUNT(*) FROM users WHERE role_id = 2`
- Count venues: `SELECT COUNT(*) FROM users WHERE role_id = 3`
- Count pending artist approvals: join `users` + `artist_profiles` WHERE `approval_status = 'PENDING_APPROVAL'`
- Count pending venue approvals: join `users` + `venue_profiles` WHERE equivalent pending status
- No audit log required (read-only).

---

### 2.3 User List

**Method + path:** `GET /v1/admin/users`  
**Auth:** Admin JWT guard

> **Note:** A generic `GET /v1/users` already exists in `UsersController` and returns a paginated `InfinityPaginationResponseDto<User>`. The admin frontend needs a flat list with role + account-status filtering. Either (a) extend the existing endpoint with additional query params, or (b) add a dedicated endpoint. Option (a) is preferred to avoid duplication.

**Query parameters:**
| Param | Type | Description |
|---|---|---|
| `page` | `number` | 1-indexed page (default: 1) |
| `limit` | `number` | Items per page, max 50 (default: 50) |
| `role` | `'artist' \| 'venue'` | Filter by role |
| `status` | `'PENDING_VERIFICATION' \| 'ACTIVE' \| 'SUSPENDED' \| 'LOCKED' \| 'ANONYMISED'` | Filter by account status |
| `search` | `string` | Free-text search on firstName, lastName, email |
| `sortBy` | `'createdAt' \| 'email' \| 'firstName'` | Sort field |
| `sortOrder` | `'ASC' \| 'DESC'` | Sort direction |

**Request body:** None

**Response body:**
```typescript
{
  data: Array<{
    id: string
    email: string | null
    firstName: string | null
    lastName: string | null
    role: { id: number; name: string }      // 2=artist, 3=venue
    accountStatus: AccountStatusEnum        // see §3.3 for mapping
    createdAt: string                       // ISO 8601
    updatedAt: string
    lastLoginAt: string | null              // ISO 8601
  }>
  hasNextPage: boolean
}
```

**DB tables read:** `users`  
**Business logic:**
- Admin may see all users regardless of status.
- `ANONYMISED` users should still be listed (admin context) but email/name fields may be masked.
- No audit log required (read-only list).

---

### 2.4 Get Artist Profile (Admin)

**Method + path:** `GET /v1/admin/artist/:id`  
**Auth:** Admin JWT guard

**Path param:** `id: string` — the user's UUID

**Query parameters:** None

**Request body:** None

**Response body:**
```typescript
{
  id: string                        // user UUID
  basicInfo: {
    stageName: string
    profilePicture: string | null    // URL
    shortBio: string | null
    extendedBio: string | null
    location: {
      city: string
      regions: string[]
    } | null
    artistType: ArtistTypeEnum | null  // SOLO | DUO | BAND | DJ | PRODUCER | OTHER
    openToTravel: boolean
    travelRadius: string | null      // e.g. "50km"
  }
  genres: {
    genres: string[]
    performanceType: PerformanceTypeEnum | null  // COVERS | ORIGINALS | BOTH
    performanceStyle: string | null
    actType: string | null
    energyLevel: EnergyLevelEnum | null
  }
  media: {
    images: string[]                 // array of press-photo URLs
    videoUrl: string | null          // primary video URL
    socialMedia: {
      instagram: string | null
      tiktok: string | null
      youtube: string | null
      facebook: string | null
      x: string | null
    }
  }
  photos: {
    images: Array<{ id: string; url: string; isPrimary: boolean }>
  }
  musicLinks: {
    links: Array<{ id: string; platform: StreamingPlatformEnum; url: string }>
  }
  bookingInfo: {
    availability: DayOfWeekEnum[]
    feeRange: {
      min: string | null
      max: string | null
      currency: string               // e.g. "AUD"
    }
    setLengths: string[]
  }
  liveSetup: {
    setupType: string | null
    equipment: string[]
    technicalNotes: string | null
  }
  approvalStatus: ArtistApprovalStatusEnum   // DRAFT | PENDING_APPROVAL | APPROVED | REJECTED
  accountStatus: AccountStatusEnum
  createdAt: string
  updatedAt: string
}
```

**DB tables read:** `users`, `artist_profiles`, `artist_genres`, `artist_press_photos`, `artist_videos`, `artist_live_setup`, `artist_releases`, `artist_social_links` (or equivalent)  
**Business logic:**
- Admin can fetch any artist by ID regardless of approval or account status.
- Returns 404 if user not found or is not role=artist.
- No audit log required (read-only).

---

### 2.5 Artist Approval Decision

**Method + path:** `POST /v1/admin/artist/:id/decision`  
**Auth:** Admin JWT guard

**Path param:** `id: string` — artist user UUID

**Query parameters:** None

**Request body DTO:**
```typescript
{
  action: 'approve' | 'request-changes' | 'reject'
  feedback: string    // admin's message to the artist; may be empty string
}
```

**Response body:**
```typescript
{
  ok: true
  artistId: string
  newApprovalStatus: ArtistApprovalStatusEnum
}
```

**DB tables read/written:**
- **Read:** `users`, `artist_profiles`
- **Write:** `artist_profiles` (approval_status), `audit_logs`, `email_notifications`

**Business logic:**
- Permitted only when `artist_profiles.approval_status = 'PENDING_APPROVAL'`.
- Return 409 if current status is not PENDING_APPROVAL.
- Transition map:
  | `action` | `artist_profiles.approval_status` before | after |
  |---|---|---|
  | `approve` | `PENDING_APPROVAL` | `APPROVED` |
  | `request-changes` | `PENDING_APPROVAL` | `PENDING_APPROVAL` (stays, but feedback is sent) |
  | `reject` | `PENDING_APPROVAL` | `REJECTED` |
- On `approve`: set `users.account_status = 'ACTIVE'` if it was `PENDING_VERIFICATION`.
- On every action: write `AUDIT_LOG` with `action = 'ADMIN_ARTIST_<ACTION>'`, `beforeState`, `afterState`, `feedback`.
- On every action: enqueue `EMAIL_NOTIFICATION` to the artist with `feedback` content and the decision.
  - Template keys: `artist-approved`, `artist-request-changes`, `artist-rejected`

---

### 2.6 Artist Status Action (Suspend / Ban / Unsuspend / Unban)

**Method + path:** `PATCH /v1/admin/artist/:id/status`  
**Auth:** Admin JWT guard

**Path param:** `id: string`

**Query parameters:** None

**Request body DTO:**
```typescript
{
  action: 'suspend' | 'ban' | 'unsuspend' | 'unban'
  reason?: string    // optional admin note
}
```

**Response body:**
```typescript
{
  ok: true
  userId: string
  newAccountStatus: AccountStatusEnum
}
```

**DB tables read/written:**
- **Read:** `users`
- **Write:** `users` (account_status), `audit_logs`

**Business logic:**
- Valid transitions:
  | `action` | From (account_status) | To |
  |---|---|---|
  | `suspend` | `ACTIVE` | `SUSPENDED` |
  | `ban` | `ACTIVE` or `SUSPENDED` | `ANONYMISED`* |
  | `unsuspend` | `SUSPENDED` | `ACTIVE` |
  | `unban` | `ANONYMISED` | `ACTIVE` |
- *Frontend labels this "Ban" — maps to `ANONYMISED` in backend (see §3.3 for full mapping rationale). Consider adding a `BANNED` status to align terminology, or document the mapping clearly.
- Return 422 if the transition is invalid for the current status.
- Write `AUDIT_LOG` on every mutation: `action = 'ADMIN_ARTIST_SUSPENDED'` etc.
- Invalidate any active sessions for the user on suspend/ban.

---

### 2.7 Artist Password Reset (Admin-triggered)

**Method + path:** `POST /v1/admin/artist/:id/reset-password`  
**Auth:** Admin JWT guard

**Path param:** `id: string`

**Query parameters:** None

**Request body:** None (body is empty — admin triggers a reset email, does not set the password directly)

**Response body:**
```typescript
{
  ok: true
  message: "Password reset email sent"
}
```

**DB tables read/written:**
- **Read:** `users`
- **Write:** `sessions` (invalidate current), `audit_logs`, `email_notifications`

**Business logic:**
- Generate a password-reset token (same flow as `POST /v1/auth/forgot-password`, but triggered by admin not user).
- Send reset email to the artist's registered email address.
- Write `AUDIT_LOG`: `action = 'ADMIN_PASSWORD_RESET_TRIGGERED'`.

---

### 2.8 Get Venue Profile (Admin)

**Method + path:** `GET /v1/admin/venue/:id`  
**Auth:** Admin JWT guard

**Path param:** `id: string` — venue user UUID

**Query parameters:** None

**Request body:** None

**Response body:**
```typescript
{
  id: string
  venueDetails: {
    venueName: string
    address: string | null
    city: string | null
    state: string | null
    zipCode: string | null
    description: string | null
  }
  capacitySpecs: {
    capacity: number | null
    hasStage: boolean
    stageDimensions: string | null
    soundSystem: string[]
    soundSystemNotes: string | null
    amenities: string[]
  }
  photos: {
    images: Array<{ id: string; url: string; type: VenuePhotoTypeEnum }>
  }
  bookingPreferences: {
    eventTypes: string[]
    genres: string[]
    pricingModel: string | null
    minPrice: string | null
    maxPrice: string | null
    bookingNotes: string | null
  }
  approvalStatus: string    // e.g. 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
  accountStatus: AccountStatusEnum
  createdAt: string
  updatedAt: string
}
```

**DB tables read:** `users`, `venue_profiles`, `venue_photos`, `venue_preferences`  
**Business logic:**
- Admin can fetch any venue regardless of status.
- Returns 404 if user not found or is not role=venue.
- No audit log required.

---

### 2.9 Venue Approval Decision

**Method + path:** `POST /v1/admin/venue/:id/decision`  
**Auth:** Admin JWT guard

**Path param:** `id: string`

**Request body DTO:**
```typescript
{
  action: 'approve' | 'request-changes' | 'reject'
  feedback: string
}
```

**Response body:**
```typescript
{
  ok: true
  venueId: string
  newApprovalStatus: string
}
```

**DB tables read/written:**
- **Read:** `users`, `venue_profiles`
- **Write:** `venue_profiles` (approval_status), `audit_logs`, `email_notifications`

**Business logic:** Mirror of §2.5 for venues.
- Only permitted when current approval status is PENDING_APPROVAL.
- Template keys: `venue-approved`, `venue-request-changes`, `venue-rejected`
- Write audit log on every mutation.

---

### 2.10 Venue Status Action (Suspend / Ban / Unsuspend / Unban)

**Method + path:** `PATCH /v1/admin/venue/:id/status`  
**Auth:** Admin JWT guard

**Request body DTO:** Same as §2.6 (same `action` union)

**Response body:** Same shape as §2.6

**DB tables read/written:** `users`, `audit_logs`  
**Business logic:** Mirror of §2.6 for venues — same transition table, same audit log requirement.

---

### 2.11 Venue Password Reset (Admin-triggered)

**Method + path:** `POST /v1/admin/venue/:id/reset-password`  
**Auth:** Admin JWT guard

Identical behaviour to §2.7 — trigger reset email for the venue account.

---

### 2.12 Quick Status Actions on User Management Table

The User Management table shows Approve / Reject / Suspend / Unsuspend / Ban / Unban buttons per row without navigating to the detail page. These call the same underlying endpoints as the detail pages but are initiated from the list view.

**Mapping:**

| Button | Endpoint |
|---|---|
| Approve (artist) | `POST /v1/admin/artist/:id/decision` with `{ action: 'approve', feedback: '' }` |
| Reject (artist) | `POST /v1/admin/artist/:id/decision` with `{ action: 'reject', feedback: '' }` |
| Approve (venue) | `POST /v1/admin/venue/:id/decision` with `{ action: 'approve', feedback: '' }` |
| Reject (venue) | `POST /v1/admin/venue/:id/decision` with `{ action: 'reject', feedback: '' }` |
| Suspend (artist) | `PATCH /v1/admin/artist/:id/status` with `{ action: 'suspend' }` |
| Ban (artist) | `PATCH /v1/admin/artist/:id/status` with `{ action: 'ban' }` |
| Unsuspend (artist) | `PATCH /v1/admin/artist/:id/status` with `{ action: 'unsuspend' }` |
| Unban (artist) | `PATCH /v1/admin/artist/:id/status` with `{ action: 'unban' }` |
| Suspend (venue) | `PATCH /v1/admin/venue/:id/status` with `{ action: 'suspend' }` |
| Ban (venue) | `PATCH /v1/admin/venue/:id/status` with `{ action: 'ban' }` |
| Unsuspend (venue) | `PATCH /v1/admin/venue/:id/status` with `{ action: 'unsuspend' }` |
| Unban (venue) | `PATCH /v1/admin/venue/:id/status` with `{ action: 'unban' }` |

No new endpoint is needed — all of these reuse §2.5, §2.6, §2.9, §2.10.

---

### 2.13 Content Moderation Queue

**Method + path:** `GET /v1/admin/moderation`  
**Auth:** Admin JWT guard

**Query parameters:**
| Param | Type | Description |
|---|---|---|
| `targetType` | `'ARTIST_PROFILE' \| 'VENUE_PROFILE' \| 'MESSAGE' \| 'MEDIA_ASSET'` | Filter by target type |
| `status` | `'PENDING' \| 'UNDER_REVIEW' \| 'RESOLVED_CLEARED' \| 'RESOLVED_ACTIONED'` | Filter by moderation status (default: `PENDING`) |
| `page` | `number` | Default: 1 |
| `limit` | `number` | Default: 50 |

**Request body:** None

**Response body:**
```typescript
{
  data: Array<{
    id: string                          // moderation_flag UUID
    userId: string                      // flaggedByUserId (or targetId owner)
    name: string                        // display name of the user who owns the flagged content
    targetType: ModerationTargetTypeEnum
    targetId: string                    // ID of the flagged record
    reason: ModerationReasonEnum        // SPAM | INAPPROPRIATE | FAKE | COPYRIGHT | OTHER
    notes: string | null
    status: ModerationStatusEnum
    contentUrl: string | null           // resolved URL of the flagged content for preview
    role: 'artist' | 'venue'            // derived from the target owner's role
    submittedAt: string                 // ISO 8601
  }>
  hasNextPage: boolean
}
```

**DB tables read:** `moderation_flags`, `users`, `media` (to resolve `contentUrl`)  
**Business logic:**
- Default filter: `status = 'PENDING'` — the queue shows unresolved items.
- `contentUrl` is resolved server-side: for `MEDIA_ASSET` targetType, look up the media record and return its URL; for `ARTIST_PROFILE`/`VENUE_PROFILE`, return the profile photo URL.
- `name` is the display name of the user who owns the targeted content (not necessarily who flagged it).

---

### 2.14 Moderation Item — Approve

**Method + path:** `POST /v1/admin/moderation/:id/approve`  
**Auth:** Admin JWT guard

**Path param:** `id: string` — moderation_flag UUID

**Query parameters:** None

**Request body:**
```typescript
{
  reviewNotes?: string   // optional admin note
}
```

**Response body:**
```typescript
{
  ok: true
  flagId: string
  newStatus: 'RESOLVED_CLEARED'
}
```

**DB tables read/written:**
- **Write:** `moderation_flags` (status → `RESOLVED_CLEARED`, reviewedByUserId, reviewedAt, reviewNotes), `audit_logs`

**Business logic:**
- "Approve" means the flagged content is cleared — it stays live on the platform.
- Set `moderation_flags.status = 'RESOLVED_CLEARED'`.
- Set `moderation_flags.reviewed_by_user_id = req.user.id`.
- Set `moderation_flags.reviewed_at = NOW()`.
- Write `AUDIT_LOG`: `action = 'ADMIN_MODERATION_CLEARED'`.

---

### 2.15 Moderation Item — Reject

**Method + path:** `POST /v1/admin/moderation/:id/reject`  
**Auth:** Admin JWT guard

**Path param:** `id: string`

**Request body:**
```typescript
{
  reviewNotes?: string
}
```

**Response body:**
```typescript
{
  ok: true
  flagId: string
  newStatus: 'RESOLVED_ACTIONED'
}
```

**DB tables read/written:**
- **Write:** `moderation_flags` (status → `RESOLVED_ACTIONED`), `audit_logs`, optionally `media` (soft-delete flagged asset)

**Business logic:**
- "Reject" means the flagged content is removed/actioned.
- Set `moderation_flags.status = 'RESOLVED_ACTIONED'`.
- For `MEDIA_ASSET` target type: soft-delete the media record (`media.deleted_at = NOW()`).
- For `MESSAGE` target type: optionally archive or soft-delete the message.
- Write `AUDIT_LOG`: `action = 'ADMIN_MODERATION_ACTIONED'`.
- Optionally enqueue `EMAIL_NOTIFICATION` to the content owner.

---

### 2.16 Admin Message Conversations List

**Method + path:** `GET /v1/admin/messages`  
**Auth:** Admin JWT guard

> The existing `GET /v1/messages/conversations` only returns conversations for the authenticated user (artist or venue). This new endpoint returns **all** conversations platform-wide for admin oversight.

**Query parameters:**
| Param | Type | Description |
|---|---|---|
| `search` | `string` | Free-text search on artist name or venue name |
| `role` | `'artist' \| 'venue'` | Filter conversations by one participant's role |
| `page` | `number` | Default: 1 |
| `limit` | `number` | Default: 50 |

**Request body:** None

**Response body:**
```typescript
{
  data: Array<{
    id: string
    artist: {
      id: string
      name: string           // artist stage name
      avatar: string | null  // profile photo URL
    }
    venue: {
      id: string
      name: string           // venue name
      avatar: string | null  // venue photo URL
    }
    messages: Array<{
      id: string
      senderId: string
      content: string
      timestamp: string      // ISO 8601
      isRead: boolean
      attachments: Array<{
        id: string
        type: 'image' | 'video' | 'audio' | 'pdf' | 'document'
        name: string
        url: string
        size: string | null
      }>
    }>
    status: ConversationStatusEnum   // ACTIVE | ARCHIVED | BLOCKED
    lastMessageAt: string | null
  }>
  hasNextPage: boolean
}
```

**DB tables read:** `conversations`, `messages`, `message_attachments`, `users`, `artist_profiles`, `venue_profiles`  
**Business logic:**
- Admin sees all conversations regardless of `ConversationStatusEnum`.
- Conversations sorted by `lastMessageAt DESC`.
- Messages returned in full (no truncation) — this is a moderation view.
- No audit log required (read-only).

---

### 2.17 Activity Logs for a User

**Method + path:** `GET /v1/admin/logs`  
**Auth:** Admin JWT guard

> The `audit_logs` table already exists and is written to by `insertAuditLog()`. This endpoint exposes a read interface. The frontend currently hardcodes a user ID — the endpoint **must** accept `userId` as a query param to be useful.

**Query parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `userId` | `string` | Yes | Target user UUID to fetch logs for |
| `page` | `number` | No | Default: 1 |
| `limit` | `number` | No | Default: 50 |
| `event` | `string` | No | Filter by action type (e.g. `ADMIN_USER_UNLOCKED`) |

**Request body:** None

**Response body:**
```typescript
{
  data: Array<{
    id: string
    userId: string           // targetId from audit_logs
    actorUserId: string | null
    event: string            // action field from audit_logs
    change: string           // human-readable summary derived from afterState
    changeFrom: string | null
    changeTo: string | null
    time: string             // ISO 8601 (maps from created_at)
    metadata: Record<string, unknown> | null
  }>
  hasNextPage: boolean
}
```

**DB tables read:** `audit_logs`  
**Business logic:**
- Query `audit_logs WHERE target_id = userId ORDER BY created_at DESC`.
- `changeFrom` / `changeTo` derived from `before_state` / `after_state` JSON columns.
- `change` is a server-generated human-readable string (e.g. "account_status: ACTIVE → SUSPENDED").
- No audit log required (read-only).

---

### 2.18 Resources — List

**Method + path:** `GET /v1/admin/resources`  
**Auth:** Admin JWT guard

**Query parameters:** None

**Request body:** None

**Response body:**
```typescript
Array<{
  id: string
  type: 'youtube' | 'website' | 'document'
  title: string
  description: string
  url: string               // YouTube/website URL or PDF file URL
  fileName: string | null   // display name for document type
  sortOrder: number         // 0-indexed position for drag-and-drop reorder
  createdAt: string
  updatedAt: string
}>
```

**DB tables read:** `admin_resources` (NEW TABLE — see §3.2)  
**Business logic:**
- Return records ordered by `sortOrder ASC`.
- No audit log required.

---

### 2.19 Resources — Create

**Method + path:** `POST /v1/admin/resources`  
**Auth:** Admin JWT guard  
**Content-Type:** `application/json` for youtube/website; `multipart/form-data` for document

**Request body DTO (JSON — youtube or website):**
```typescript
{
  type: 'youtube' | 'website'
  title: string             // required, max 255 chars
  description: string       // required
  url: string               // required, must be valid URL
}
```

**Request body (multipart — document):**
```
type: "document"
title: string
description: string
file: binary (PDF, max 20 MB)
```

**Response body:**
```typescript
{
  id: string
  type: 'youtube' | 'website' | 'document'
  title: string
  description: string
  url: string
  fileName: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}
```

**DB tables read/written:**
- **Write:** `admin_resources`, and `media` / S3 (for document type file upload)
- **Write:** `audit_logs`

**Business logic:**
- For `document` type: upload PDF via existing `FilesService` / S3 presigned upload; store the returned file URL as `url` and original filename as `fileName`.
- `sortOrder` defaults to `MAX(sortOrder) + 1` so new items append to the end.
- Write `AUDIT_LOG`: `action = 'ADMIN_RESOURCE_CREATED'`.

---

### 2.20 Resources — Update

**Method + path:** `PATCH /v1/admin/resources/:id`  
**Auth:** Admin JWT guard

**Path param:** `id: string`

**Request body DTO:**
```typescript
{
  type?: 'youtube' | 'website' | 'document'
  title?: string
  description?: string
  url?: string
}
```

**Response body:** Same shape as §2.18 array item

**DB tables read/written:** `admin_resources`, `audit_logs`  
**Business logic:**
- Only update the fields present in the request body (partial update).
- Return 404 if record not found.
- Write `AUDIT_LOG`: `action = 'ADMIN_RESOURCE_UPDATED'`, `beforeState`, `afterState`.

---

### 2.21 Resources — Delete

**Method + path:** `DELETE /v1/admin/resources/:id`  
**Auth:** Admin JWT guard

**Path param:** `id: string`

**Request body:** None

**Response body:** `204 No Content`

**DB tables read/written:** `admin_resources`, `audit_logs`  
**Business logic:**
- Hard delete (no soft-delete needed for admin resources).
- If type = `document`, optionally delete the S3 object as well.
- Write `AUDIT_LOG`: `action = 'ADMIN_RESOURCE_DELETED'`, `beforeState`.

---

### 2.22 Resources — Reorder

**Method + path:** `POST /v1/admin/resources/reorder`  
**Auth:** Admin JWT guard

**Request body DTO:**
```typescript
{
  orderedIds: string[]   // complete ordered list of all resource IDs
}
```

**Response body:**
```typescript
{
  ok: true
}
```

**DB tables read/written:** `admin_resources`  
**Business logic:**
- For each ID at index `i`, set `admin_resources.sort_order = i` in a single transaction.
- Return 422 if `orderedIds` does not contain all existing resource IDs (prevents silent data loss).
- No audit log required (cosmetic ordering).

---

## 3. Gap Analysis

### 3.1 Full Endpoint Checklist

| # | Method + Path | Frontend Needs | Status | NestJS Module |
|---|---|---|---|---|
| 1 | `POST /v1/auth/email/login` | Admin login | **EXISTS** — `AuthModule` | — |
| 2 | `GET /v1/admin/stats` | Dashboard stat cards | **MISSING** | `AdminModule` |
| 3 | `GET /v1/admin/users` | User management list | **PARTIALLY EXISTS** — `GET /v1/users` in `UsersModule` exists with admin guard + pagination, but lacks `role`, `accountStatus` filter params and uses a different response shape. Extend or add dedicated admin route. | `AdminModule` or extend `UsersModule` |
| 4 | `GET /v1/admin/artist/:id` | Artist detail / inspection page | **MISSING** — existing `GET /v1/artist/profile` only serves the authenticated artist themselves | `AdminModule` |
| 5 | `POST /v1/admin/artist/:id/decision` | Artist approval (approve / request-changes / reject) | **MISSING** | `AdminModule` |
| 6 | `PATCH /v1/admin/artist/:id/status` | Suspend / ban / unsuspend / unban artist | **MISSING** — existing `PATCH /v1/admin/users/:id/unlock` only handles unlock, no suspend/ban | `AdminModule` |
| 7 | `POST /v1/admin/artist/:id/reset-password` | Reset artist password from detail page | **MISSING** | `AdminModule` |
| 8 | `GET /v1/admin/venue/:id` | Venue detail / inspection page | **MISSING** — existing `GET /v1/venue/profile` only serves the authenticated venue | `AdminModule` |
| 9 | `POST /v1/admin/venue/:id/decision` | Venue approval decision | **MISSING** | `AdminModule` |
| 10 | `PATCH /v1/admin/venue/:id/status` | Suspend / ban / unsuspend / unban venue | **MISSING** | `AdminModule` |
| 11 | `POST /v1/admin/venue/:id/reset-password` | Reset venue password | **MISSING** | `AdminModule` |
| 12 | `GET /v1/admin/moderation` | Content moderation queue | **MISSING** — `moderation_flags` table and domain class exist but no admin read endpoint | `AdminModule` |
| 13 | `POST /v1/admin/moderation/:id/approve` | Approve moderation item | **MISSING** | `AdminModule` |
| 14 | `POST /v1/admin/moderation/:id/reject` | Reject (action) moderation item | **MISSING** | `AdminModule` |
| 15 | `GET /v1/admin/messages` | Message moderation — all conversations | **MISSING** — `GET /v1/messages/conversations` only returns the authenticated user's own conversations | `AdminModule` |
| 16 | `GET /v1/admin/logs?userId=:id` | Activity log viewer | **MISSING** — `audit_logs` table exists and `insertAuditLog()` writes to it, but no read endpoint exists | `AdminModule` |
| 17 | `GET /v1/admin/resources` | Resources list | **MISSING** — no `admin_resources` table or module | `AdminModule` (new `AdminResourcesModule`) |
| 18 | `POST /v1/admin/resources` | Create resource | **MISSING** | `AdminModule` |
| 19 | `PATCH /v1/admin/resources/:id` | Edit resource | **MISSING** | `AdminModule` |
| 20 | `DELETE /v1/admin/resources/:id` | Delete resource | **MISSING** | `AdminModule` |
| 21 | `POST /v1/admin/resources/reorder` | Drag-and-drop reorder | **MISSING** | `AdminModule` |

**Summary:** 1 EXISTS, 1 PARTIALLY EXISTS, 19 MISSING

---

### 3.2 Missing DB Tables

| Table | Purpose | Status |
|---|---|---|
| `audit_logs` | Admin action trail — actorUserId, action, targetType, targetId, beforeState, afterState, metadata | **EXISTS** — raw SQL schema used in `audit-log.queries.ts`. No TypeORM entity found; add one for type-safe querying when building `GET /v1/admin/logs`. |
| `email_notifications` | Queue of transactional emails triggered by admin actions | **EXISTS** — `EmailNotification` domain class at `src/admin/domain/email-notification.ts` and query helper at `src/admin/infrastructure/persistence/relational/queries/email-notification.queries.ts`. Verify TypeORM entity and migration exist. |
| `moderation_flags` | User-reported content flagging | **EXISTS** — `ModerationFlagEntity` and repository exist. No admin read endpoint yet. |
| `admin_resources` | Help resources (YouTube / website / document) managed by admin | **MISSING** — No table, entity, migration, or module. Must be created. |

**`admin_resources` table schema (proposed):**
```sql
CREATE TABLE admin_resources (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        VARCHAR(20) NOT NULL CHECK (type IN ('youtube', 'website', 'document')),
  title       VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  url         TEXT NOT NULL,
  file_name   VARCHAR(255),          -- display name for document type
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_resources_sort_order ON admin_resources (sort_order);
```

---

### 3.3 Status Enum Mismatches

The frontend uses a simplified status vocabulary that does not map 1:1 to the backend enums. The integration layer (backend service methods) must handle this translation.

**`AccountStatusEnum` (backend) vs frontend display labels:**

| Backend `AccountStatusEnum` | Frontend `status` value | Admin UI label |
|---|---|---|
| `PENDING_VERIFICATION` | `not-approved` | Badge: "Not Approved" |
| `ACTIVE` | `active` | Badge: "Active" |
| `SUSPENDED` | `suspended` | Badge: "Suspended" |
| `ANONYMISED` | `banned` | Badge: "Banned" |
| `LOCKED` | — | Not shown in frontend yet (maps to "Suspended" visually) |

**`ArtistApprovalStatusEnum` (backend) vs frontend routing:**

| Backend value | Frontend behaviour |
|---|---|
| `DRAFT` | Not in current frontend — treat as `not-approved` |
| `PENDING_APPROVAL` | Routes to `/admin/users/artistapproval/:id` |
| `APPROVED` | Routes to `/admin/users/artist/:id` |
| `REJECTED` | Routes to `/admin/users/artist/:id` (same detail view) |

**`request-changes` action (frontend) → no matching backend enum value.**  
The `ArtistApprovalStatusEnum` does not have a `CHANGE_REQUESTED` value. Two options:
- **Option A:** Add `CHANGE_REQUESTED` to the enum and a corresponding migration.
- **Option B:** Keep status as `PENDING_APPROVAL` and record the feedback + timestamp in a separate `artist_approval_feedback` table (or as a JSON column on `artist_profiles`).

Option A is cleaner. The migration is low-risk (additive only).

---

### 3.4 Cross-cutting Concerns

| Concern | Current State | Required Action |
|---|---|---|
| **Audit log on every mutation** | `insertAuditLog()` helper exists and is used in `PATCH /v1/admin/users/:id/unlock`. | Every new mutation endpoint in §2 must call `insertAuditLog()` with appropriate `action`, `beforeState`, `afterState`. |
| **Email notifications** | `EmailNotification` domain class exists. Helper at `email-notification.queries.ts`. | Approval decisions (§2.5, §2.9) and moderation rejections (§2.15) must enqueue email notifications. Confirm email templates exist for `artist-approved`, `artist-request-changes`, `artist-rejected`, `venue-approved`, `venue-request-changes`, `venue-rejected`. |
| **Session invalidation on ban/suspend** | Not implemented. | `PATCH /v1/admin/:role/:id/status` with `ban` or `suspend` action must invalidate all active sessions for that user via `SessionService`. |
| **Activity log URL is hardcoded** | `/admin/log` page hardcodes `usr_1001`. | Route must become `/admin/log?userId=:id`. The `⋮` menu in `UserManagementTable` must pass the clicked user's ID. `GET /v1/admin/logs` must accept `userId` query param (§2.17). |
| **BFF proxy layer** | tap-admin Next.js API routes currently return mock data. | Each `src/app/api/admin/*/route.ts` must be updated to proxy to the real tap-backend URL with the admin JWT forwarded in the `Authorization` header. |
| **Admin module registration** | `AdminModule` exists (`admin-users.controller.ts`) but is not imported in `app.module.ts` based on current imports. | Verify `AdminModule` is registered in `AppModule`. Add all new admin controllers and services to it. |
