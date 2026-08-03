# TAP Admin — Action Workflows

> 🗂️ **AUDIT NOTE — 2026-06-24:** Several workflows marked "stubbed/console.log" below are now wired to the real backend (approval approve/reject/req-changes, moderation approve/reject, resources CRUD, user suspend/ban). Verify each "Stubbed" entry against current handlers. Consolidated state: `../tap-platform/projectUpdate24June.md`.
>
> 🗂️ **AUDIT NOTE — 2026-07-31:** A few more specifics as of today: the Artist/Venue **Approval pages only expose Approve and Reject** — there is no "Request Changes" button in the current UI (the `req-changes`/`requestArtistChanges` API function still exists but is unused). **Resource drag-reorder is persisted** (`PUT /admin/resources` bulk-replace), not local-only. A new **Vendor Management** screen (`/admin/vendors` — categories + listings CRUD) and a **dashboard analytics section** (user growth, artist genre/location charts) were added and aren't covered by this document. See [tap_admin_screens_inventory.md](tap_admin_screens_inventory.md) and [tap_admin_data_contracts.md](tap_admin_data_contracts.md) for current, maintained coverage of all workflows.

> **Every interactive workflow that changes state, triggers navigation, or sends data.**
> "Stubbed" means the button exists in the UI but the handler is a `console.log` or absent — no real API call is wired yet.

---

## Table of Contents

1. [Status Transition Map](#1-status-transition-map)
2. [User Management Table](#2-user-management-table)
3. [Artist Detail Page](#3-artist-detail-page)
4. [Artist Approval Page](#4-artist-approval-page)
5. [Venue Detail Page](#5-venue-detail-page)
6. [Venue Approval Page](#6-venue-approval-page)
7. [Content Moderation Queue](#7-content-moderation-queue)
8. [Moderation Preview Dialog](#8-moderation-preview-dialog)
9. [Message Moderation](#9-message-moderation)
10. [Activity Logs](#10-activity-logs)
11. [Resources Management](#11-resources-management)
12. [Stub Inventory](#12-stub-inventory)
13. [Conditional Rendering & Permission Checks](#13-conditional-rendering--permission-checks)

---

## 1. Status Transition Map

### User Account Status

```
                    ┌─────────────────────────────────────────────────────┐
                    │                                                       │
              Approve │              Unsuspend                   Unban       │
not-approved ──────► active ──Suspend──► suspended ──Ban──► banned ◄────────┤
     │               │                                    ▲                 │
     │   Reject       │                                    │                 │
     └───────────────►│            Ban (from active) ──────┘                 │
     │                │                                                       │
     │ Request Changes │                                                       │
     └───────────────► changeRequested (proposed, not yet in User type)       │
                                                                               │
  All statuses except banned can be banned ──────────────────────────────────┘
```

**Current `status` union:** `'active' | 'not-approved' | 'suspended' | 'banned'`

> `'changeRequested'` and `'rejected'` are implied by the Approval page's "Request Changes" and "Reject" buttons but are **not** in the `User` type yet.

---

### Navigation Routing by Status + Role
**File:** `src/utils/AdminRoutes.ts`

| Role     | Status          | Detail route                          |
|----------|-----------------|---------------------------------------|
| `artist` | `not-approved`  | `/admin/users/artistapproval/:id`     |
| `artist` | any other       | `/admin/users/artist/:id`             |
| `venue`  | `not-approved`  | `/admin/users/venueapproval/:id`      |
| `venue`  | any other       | `/admin/users/venue/:id`              |

Both roles: "View Activity Log" always routes to `/admin/log`.

---

## 2. User Management Table

**File:** `src/components/admin/users/UserManagementTable.tsx`
**Page:** `src/app/admin/users/page.tsx`

---

### 2a. Navigate to User Detail

**Trigger:** Click any of — User ID cell, Name cell, Email cell (all three fire the same handler)

**Steps:** Direct navigation, no confirmation, no form input.

**Payload:** None (navigation only)

**Success:** `router.push(getAdminUserRoute(user))` — routes per the table in §1.

**Error:** None.

---

### 2b. View User Activity Log

**Trigger:** Click the `⋮` (MoreVertical) icon at the right end of any row.

**Steps:**
1. `e.stopPropagation()` prevents row-click navigation from firing.
2. Direct navigation — no confirmation.

**Payload:** None (navigation only)

**Success:** `router.push('/admin/log')`

**Error:** None.

---

### 2c. Status Action Buttons — Suspend / Ban / Approve / Reject / Unsuspend / Unban

> **Status: STUBBED** — handlers are `console.log` only.

**Trigger:** One of the following buttons, rendered conditionally by `user.status`:

| Current status  | Buttons shown                |
|-----------------|------------------------------|
| `active`        | **Suspend**, **Ban**         |
| `not-approved`  | **Approve**, **Reject**      |
| `suspended`     | **Unsuspend**, **Ban**       |
| `banned`        | **Unban**                    |

**Steps:**
1. Button click fires inline handler.
2. No confirmation dialog.
3. No form input.

**Intended Payload:**
```typescript
{ userId: string, action: 'suspend' | 'ban' | 'approve' | 'reject' | 'unsuspend' | 'unban' }
```

**Success (not yet implemented):** Update user's `status` in local state; refresh badge; show toast.

**Error (not yet implemented):** Show error toast.

**Status Transitions:**

| Button      | From             | To          |
|-------------|------------------|-------------|
| Suspend     | `active`         | `suspended` |
| Ban         | `active`         | `banned`    |
| Ban         | `suspended`      | `banned`    |
| Approve     | `not-approved`   | `active`    |
| Reject      | `not-approved`   | `rejected`  |
| Unsuspend   | `suspended`      | `active`    |
| Unban       | `banned`         | `active`    |

---

### 2d. Filter & Search Controls

All filtering is **client-side** — no server query params.

**Controls and their state:**

| Control              | State var      | Values                                               |
|----------------------|----------------|------------------------------------------------------|
| Search field (text)  | `search`       | free string                                          |
| Search-by dropdown   | `filter`       | `'name' \| 'id' \| 'email' \| 'joined' \| 'lastlogin'` |
| Status dropdown      | `statusFilter` | `'all' \| 'active' \| 'not-approved' \| 'suspended' \| 'banned'` |
| Role toggle buttons  | `roleFilter`   | `'artist' \| 'venue'`                               |

**Pagination:**
- `ITEMS_PER_PAGE = 50`
- `currentPage` (1-indexed)
- Previous / page-number / Next buttons; disabled at boundaries.
- Footer displays: "Showing X–Y of Z"

**Trigger:** Any control change immediately re-filters; pagination resets to page 1.

---

## 3. Artist Detail Page

**File:** `src/app/admin/users/artist/[id]/page.tsx`

> All three action buttons on this page are **STUBBED** — no `onClick` handlers are attached.

---

### 3a. Suspend

**Trigger:** Button labelled "Suspend" (Shield icon, green/active colour).

**Steps:** Click only — no confirmation, no form.

**Intended Payload:**
```typescript
{ artistId: string, action: 'suspend' }
```

**Intended Success:** Status badge → `suspended`; toast confirmation.

**Intended Error:** Error toast.

**Status Transition:** `active` → `suspended`

---

### 3b. Ban

**Trigger:** Button labelled "Ban" (red/banned colour).

**Steps:** Click only — no confirmation.

**Intended Payload:**
```typescript
{ artistId: string, action: 'ban' }
```

**Status Transition:** Any → `banned`

---

### 3c. Reset Password

**Trigger:** Button labelled "Reset Password" (RefreshCw icon, outline variant).

**Steps:** Click only — no confirmation, no email-entry form currently.

**Intended Payload:**
```typescript
{ artistId: string, action: 'reset-password' }
```

**Status Transition:** None — account status unchanged.

---

## 4. Artist Approval Page

**File:** `src/app/admin/users/artistapproval/[id]/page.tsx`

> The feedback textarea is **uncontrolled** (no `value`/`onChange`). All three buttons are **STUBBED** — no handlers.

---

### 4a. Approve / Request Changes / Reject

**Trigger:** One of the three action buttons in the approval panel (bottom of page).

**Steps:**
1. Admin reviews the full artist profile (read-only view above).
2. Admin optionally types feedback in the `<textarea>` (placeholder: "Write feedback for the user…").
3. Admin clicks one button:

| Button            | Colour       |
|-------------------|--------------|
| **Approve**       | Green (active)|
| **Request Changes** | Amber (warning)|
| **Reject**        | Red (banned) |

**Intended Payload:**
```typescript
{
  artistId: string               // from route param [id]
  action: 'approve' | 'request-changes' | 'reject'
  feedback: string               // textarea value (may be empty)
}
```

Suggested endpoint:
```
POST /api/admin/artist/:id/decision
Body: { action, feedback }
```

**Intended Success:**
- Approve → redirect to `/admin/users` or artist detail; user status → `active`
- Request Changes → stay or redirect; user status → `changeRequested`; feedback sent to user
- Reject → redirect; user status → `rejected`

**Intended Error:** Error toast; stay on page.

**Status Transitions:**

| Action           | From           | To               |
|------------------|----------------|------------------|
| Approve          | `not-approved` | `active`         |
| Request Changes  | `not-approved` | `changeRequested` |
| Reject           | `not-approved` | `rejected`       |

**Permission / Role Check:** This page is only reachable for `role === 'artist'` AND `status === 'not-approved'` (enforced by `getAdminUserRoute()`).

---

## 5. Venue Detail Page

**File:** `src/app/admin/users/venue/[id]/page.tsx`

> All three action buttons are **STUBBED** — no handlers.

---

### 5a. Suspend Venue

**Trigger:** Button labelled "Suspend Venue" (Shield icon, green/active colour).

**Intended Payload:**
```typescript
{ venueId: string, action: 'suspend' }
```

**Status Transition:** `active` → `suspended`

---

### 5b. Ban Venue

**Trigger:** Button labelled "Ban Venue" (Ban icon, red/banned colour).

**Intended Payload:**
```typescript
{ venueId: string, action: 'ban' }
```

**Status Transition:** Any → `banned`

---

### 5c. Reset Password

**Trigger:** Button labelled "Reset Password" (RefreshCw icon, outline).

**Intended Payload:**
```typescript
{ venueId: string, action: 'reset-password' }
```

**Status Transition:** None.

---

## 6. Venue Approval Page

**File:** `src/app/admin/users/venueapproval/[id]/page.tsx`

Identical in structure to §4. All buttons **STUBBED**.

---

### 6a. Approve / Request Changes / Reject

**Steps:**
1. Admin reviews full venue profile.
2. Admin optionally types feedback in uncontrolled `<textarea>`.
3. Admin clicks Approve / Request Changes / Reject.

**Intended Payload:**
```typescript
{
  venueId: string
  action: 'approve' | 'request-changes' | 'reject'
  feedback: string
}
```

Suggested endpoint:
```
POST /api/admin/venue/:id/decision
Body: { action, feedback }
```

**Status Transitions:** Same pattern as §4 — `not-approved` → `active` / `changeRequested` / `rejected`.

**Permission / Role Check:** Page only reachable for `role === 'venue'` AND `status === 'not-approved'`.

---

## 7. Content Moderation Queue

**File:** `src/app/admin/moderation/page.tsx`
**Table component:** `src/components/admin/moderation/ModerationQueueTable.tsx`

---

### 7a. Filter by Role

**Trigger:** "Artists" / "Venues" toggle buttons.

**State:** `roleFilter: 'artist' | 'venue'` (default: `'artist'`)

**Filtering logic:**
```typescript
matchesRole = item.role === roleFilter
```

**Result:** Table re-renders with matching rows only. No server call.

---

### 7b. Filter by Type

**Trigger:** "All / Images / Video" select dropdown.

**State:** `typeFilter: 'all' | 'images' | 'video'` (default: `'all'`)

**Filtering logic:**
```typescript
matchesType = typeFilter === 'all' ? true : item.type === typeFilter
```

**Result:** Table re-renders. No server call.

---

### 7c. Open Preview Dialog (Row Click)

**Trigger:** Click anywhere on a table row.

**Steps:**
1. `onRowClick(item)` fires in parent page.
2. `setSelectedItem(item)` and `setOpen(true)` open `ModerationPreviewDialog`.

**Payload:** Full `ModerationItem` object passed to dialog.

**Success:** Dialog opens with content preview — see §8.

---

### 7d. Approve from Table

> **Status: STUBBED** — `handleApprove(id)` is `console.log` only.

**Trigger:** "Approve" button in the table row's Actions column.

**Steps:**
1. `e.stopPropagation()` prevents row-click dialog from opening.
2. `onApprove(item.id)` fires.

**Intended Payload:**
```typescript
{ id: string }   // ModerationItem.id
```

Suggested endpoint: `POST /api/admin/moderation/:id/approve`

**Intended Success:** Row removed from queue; toast "Content approved".

**Intended Error:** Error toast; row stays.

---

### 7e. Reject from Table

> **Status: STUBBED** — `handleReject(id)` is `console.log` only.

**Trigger:** "Reject" button in the table row's Actions column.

**Steps:**
1. `e.stopPropagation()`
2. `onReject(item.id)` fires.

**Intended Payload:**
```typescript
{ id: string }
```

Suggested endpoint: `POST /api/admin/moderation/:id/reject`

---

## 8. Moderation Preview Dialog

**File:** `src/components/admin/moderation/ModerationPreviewDialog.tsx`

> Both action buttons are **STUBBED** (delegated to parent which is also stubbed).

### Content Rendering by Type

The dialog renders `item.content` (a URL) differently based on `item.type`:

| `item.type`    | Rendered as                                         |
|----------------|-----------------------------------------------------|
| `profile-pic`  | `<img>` with rounded full styling                   |
| `images`       | `<img>` with object-contain styling                 |
| `video`        | `<video controls>`                                  |
| `social-links` | Text value (URL displayed as string)                |
| `music-links`  | Text value (URL displayed as string)                |
| default        | Plain text of `item.content`                        |

---

### 8a. Approve from Dialog

**Trigger:** "Approve" button in dialog footer (green/active colour).

**Steps:**
1. Dialog is open showing content preview.
2. Click Approve.
3. `onApprove(item.id)` fires — bubbles up to parent's `handleApprove`.

**Intended Payload:** `{ id: string }`

**Intended Success:** Dialog closes; item removed from queue.

---

### 8b. Reject from Dialog

**Trigger:** "Reject" button in dialog footer (outline, red border).

**Steps:**
1. Click Reject.
2. `onReject(item.id)` fires.

**Intended Payload:** `{ id: string }`

**Intended Success:** Dialog closes; item removed from queue.

---

## 9. Message Moderation

**File:** `src/app/admin/messages/page.tsx`
**Thread component:** `src/components/admin/messages/MessageThread.tsx`

> This screen is **read-only** — no moderation actions (approve/flag/delete) are wired yet.

---

### 9a. Select Conversation

**Trigger:** Click a conversation row in the left-panel list.

**Steps:**
1. `setSelected(conversation)` updates selected state.
2. Right panel renders `<MessageThread conversation={selected} />`.

**Payload:** Full `Conversation` object (local state — no API call on select).

**Success:** Thread renders with all messages and attachments.

**Error state:** If nothing selected, right panel shows "Select a conversation to view messages."

---

### 9b. Filter Conversations

**State:**

| Control          | State var      | Values                         |
|------------------|----------------|--------------------------------|
| Role filter      | `searchFilter` | `'all' \| 'artist' \| 'venue'` |
| Search input     | `search`       | free string (lowercased)       |

**Filtering logic (client-side):**
```typescript
if searchFilter === 'artist' → match c.artist.name.toLowerCase()
if searchFilter === 'venue'  → match c.venue.name.toLowerCase()
else                         → match either name

// Then sort descending by last message timestamp
```

---

### 9c. View Attachments

**Trigger:** Automatic — attachments render inline within message bubbles.

**Attachment interaction by type:**

| Type       | Interaction                              |
|------------|------------------------------------------|
| `image`    | Displayed inline as `<img>`, no click action |
| `video`    | Inline `<video controls>` — click to play |
| `audio`    | Inline `<audio controls>` — click to play |
| `pdf`      | Hyperlink — opens in new tab (gold colour) |
| `document` | Hyperlink — opens in new tab             |

---

## 10. Activity Logs

**File:** `src/app/admin/log/page.tsx`

> **Read-only screen** — no actions that mutate state.

---

### 10a. Expand Log Detail

**Trigger:** Click on a log row's change summary text (only clickable if `changeFrom` or `changeTo` exist — `pointer-events-none` otherwise).

**Steps:**
1. Click the `<summary>` element of the `<details>` accordion.
2. Native HTML `<details>` expands/collapses.
3. Chevron (▼) rotates 180° when open.

**Expanded content rendering:**

| Condition                        | Display                          |
|----------------------------------|----------------------------------|
| `changeFrom` only                | `"<value> removed"` badge        |
| `changeTo` only                  | `"<value> added"` badge          |
| Both `changeFrom` and `changeTo` | `"<from> → <to>"` with arrow     |

**Payload:** None — display only.

---

## 11. Resources Management

**File:** `src/app/admin/resources/page.tsx`
**Create dialog:** `src/components/admin/resources/CreateResourceDialog.tsx`
**View/Edit dialog:** `src/components/admin/resources/ViewResourceDialog.tsx`
**Row component:** `src/app/admin/resources/SortableRow.tsx`

---

### 11a. Create Resource

> **Status: STUBBED** — `handleCreate()` is `console.log` only.

**Trigger:** "Create Resource" button (gold background, Plus icon) opens the dialog.

**Steps:**
1. Dialog opens.
2. User selects **Type** (required): YouTube / Website / Document.
3. User enters **Title** (text input, required).
4. User enters **Description** (textarea, required).
5. Conditional field based on type:
   - `youtube` or `website` → URL text input appears.
   - `document` → PDF file input appears (`accept=".pdf"`).
6. Click "Create Resource" to submit, or "Cancel" to close.

**Form state:**
```typescript
type: 'youtube' | 'website' | 'document'   // default: 'youtube'
title: string
description: string
url: string
pdfFile: File | null
```

**Intended Payload:**
```typescript
// For youtube / website:
{ type, title, description, url }

// For document:
{ type, title, description, pdfFile }   // multipart/form-data
```

Suggested endpoint: `POST /api/admin/resources`

**Intended Success:** Dialog closes; new item appears in table.

**Validation:** None currently wired — no required-field guards.

---

### 11b. View / Edit Resource

> **Status: STUBBED** — `handleSave()` is `console.log` only.

**Trigger:** "View" button (outline) on any resource row.

**Steps:**
1. Parent page calls `setSelectedResource(item)` and `setOpen(true)`.
2. Dialog opens with left (edit form) / right (live preview) split layout.
3. Admin can edit:
   - **Type** dropdown
   - **Title** input
   - **Description** textarea
   - **URL** input (only for `youtube`/`website`)
4. Right-side live preview updates as fields change:
   - `youtube` → embedded `<iframe>` with extracted video ID
   - `website` → "Visit website" link (opens in new tab)
   - `document` → shows `resource.fileName` as text label
5. Click **"Save Changes"** or **"Close"**.

**Form state (initialised from resource prop):**
```typescript
type: ResourceType
title: string
description: string
url: string
```

**Intended Payload:**
```typescript
{ type, title, description, url }
```

Suggested endpoint: `PATCH /api/admin/resources/:id`

**Intended Success:** Dialog closes; row in table reflects updated title/type.

---

### 11c. Delete Resource

> **Status: NO HANDLER** — the Delete button has no `onClick` attached at all.

**Trigger:** "Delete" button (Trash2 icon, red text) on any resource row in `SortableRow.tsx`.

**Intended Payload:**
```typescript
{ resourceId: string }
```

Suggested endpoint: `DELETE /api/admin/resources/:id`

**Intended Success:** Row removed from table.

**Note:** No confirmation dialog is present. One should be added before wiring the real handler.

---

### 11d. Drag-and-Drop Reorder

**Trigger:** User grabs the GripVertical drag handle on any row and drops it at a new position.

**Steps:**
1. `DndContext` activates pointer/sensor when drag distance > 5px.
2. `SortableContext` provides sortable context with `verticalListSortingStrategy`.
3. On drop, `handleDragEnd(event)` fires:

```typescript
function handleDragEnd(event: any) {
  const { active, over } = event
  if (!over || active.id === over.id) return
  setItems((prev) => {
    const oldIndex = prev.findIndex((i) => i.id === active.id)
    const newIndex = prev.findIndex((i) => i.id === over.id)
    return arrayMove(prev, oldIndex, newIndex)
  })
}
```

**Payload (local only — not yet persisted to API):**
```typescript
{ orderedIds: string[] }   // the new order of all resource IDs
```

Suggested endpoint: `POST /api/admin/resources/reorder`

**Success:** Local state updates; table re-renders in new order. **Not persisted** — reloading the page resets order.

**Error:** None.

---

## 12. Stub Inventory

All of the following exist in the UI but have **no real API calls**. They must be wired before the app can ship.

| Screen              | Action                   | Current state             | Suggested endpoint                          |
|---------------------|--------------------------|---------------------------|---------------------------------------------|
| User Management     | Suspend                  | `console.log`             | `POST /api/admin/users/:id/suspend`         |
| User Management     | Unsuspend                | `console.log`             | `POST /api/admin/users/:id/unsuspend`       |
| User Management     | Ban                      | `console.log`             | `POST /api/admin/users/:id/ban`             |
| User Management     | Unban                    | `console.log`             | `POST /api/admin/users/:id/unban`           |
| User Management     | Approve (from table)     | `console.log`             | `POST /api/admin/users/:id/approve`         |
| User Management     | Reject (from table)      | `console.log`             | `POST /api/admin/users/:id/reject`          |
| Artist Detail       | Suspend                  | No `onClick`              | `POST /api/admin/artist/:id/suspend`        |
| Artist Detail       | Ban                      | No `onClick`              | `POST /api/admin/artist/:id/ban`            |
| Artist Detail       | Reset Password           | No `onClick`              | `POST /api/admin/artist/:id/reset-password` |
| Artist Approval     | Approve                  | No `onClick`              | `POST /api/admin/artist/:id/decision`       |
| Artist Approval     | Request Changes          | No `onClick`              | `POST /api/admin/artist/:id/decision`       |
| Artist Approval     | Reject                   | No `onClick`              | `POST /api/admin/artist/:id/decision`       |
| Venue Detail        | Suspend Venue            | No `onClick`              | `POST /api/admin/venue/:id/suspend`         |
| Venue Detail        | Ban Venue                | No `onClick`              | `POST /api/admin/venue/:id/ban`             |
| Venue Detail        | Reset Password           | No `onClick`              | `POST /api/admin/venue/:id/reset-password`  |
| Venue Approval      | Approve                  | No `onClick`              | `POST /api/admin/venue/:id/decision`        |
| Venue Approval      | Request Changes          | No `onClick`              | `POST /api/admin/venue/:id/decision`        |
| Venue Approval      | Reject                   | No `onClick`              | `POST /api/admin/venue/:id/decision`        |
| Moderation (table)  | Approve                  | `console.log`             | `POST /api/admin/moderation/:id/approve`    |
| Moderation (table)  | Reject                   | `console.log`             | `POST /api/admin/moderation/:id/reject`     |
| Moderation (dialog) | Approve                  | Bubbles to above stub     | Same as above                               |
| Moderation (dialog) | Reject                   | Bubbles to above stub     | Same as above                               |
| Resources           | Create Resource          | `console.log`             | `POST /api/admin/resources`                 |
| Resources           | Save Changes             | `console.log`             | `PATCH /api/admin/resources/:id`            |
| Resources           | Delete                   | **No handler at all**     | `DELETE /api/admin/resources/:id`           |
| Resources           | Reorder (drag & drop)    | Local state only          | `POST /api/admin/resources/reorder`         |
| Messages            | Any moderation action    | Not present               | TBD                                         |
| Dashboard           | Stats                    | Hardcoded strings         | `GET /api/admin/stats`                      |

---

## 13. Conditional Rendering & Permission Checks

No server-side permission checks are visible in the frontend code. All access control is implemented through **conditional rendering** on the client.

---

### By User Status (action buttons in User Management table)

```typescript
// src/components/admin/users/UserManagementTable.tsx
if (user.status === 'active')       → show [Suspend, Ban]
if (user.status === 'not-approved') → show [Approve, Reject]
if (user.status === 'suspended')    → show [Unsuspend, Ban]
if (user.status === 'banned')       → show [Unban]
```

---

### By Role + Status (routing to detail vs approval page)

```typescript
// src/utils/AdminRoutes.ts
if (user.role === 'artist' && user.status === 'not-approved') → artistapproval/[id]
if (user.role === 'artist' && user.status !== 'not-approved') → artist/[id]
if (user.role === 'venue'  && user.status === 'not-approved') → venueapproval/[id]
if (user.role === 'venue'  && user.status !== 'not-approved') → venue/[id]
```

---

### By Resource Type (conditional form fields)

```typescript
// CreateResourceDialog.tsx + ViewResourceDialog.tsx
if (type === 'youtube' || type === 'website') → show URL field
if (type === 'document')                      → show PDF file upload
```

---

### By Log Entry Fields (expandable diff row)

```typescript
// src/app/admin/log/page.tsx
const hasDiff = !!log.changeFrom || !!log.changeTo
if (!hasDiff) → summary is pointer-events-none (not clickable)
if (hasDiff)  → summary is clickable, expands diff detail
```

---

### By Message Attachment Type

```typescript
// src/components/admin/messages/MessageThread.tsx
if (attachment.type === 'image')    → <img>
if (attachment.type === 'video')    → <video controls>
if (attachment.type === 'audio')    → <audio controls>
if (attachment.type === 'pdf')      → <a href target="_blank"> (gold colour)
if (attachment.type === 'document') → <a href target="_blank"> (foreground colour)
```

---

### By Moderation Content Type (preview dialog)

```typescript
// src/components/admin/moderation/ModerationPreviewDialog.tsx
if (item.type === 'profile-pic') → <img className="rounded-full">
if (item.type === 'images')      → <img className="object-contain">
if (item.type === 'video')       → <video controls>
if (item.type === 'social-links' || 'music-links') → text display
default                          → plain text of item.content
```

---

### Textarea Controlled vs Uncontrolled

The feedback textareas on both the Artist Approval and Venue Approval pages are **uncontrolled** — they have no `value` or `onChange`. When handlers are wired, a `useRef` or controlled state must be added to read the feedback value before submitting.
