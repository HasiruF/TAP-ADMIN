# Approval End-to-End Development Plan

> ## ✅ AUDIT UPDATE — 2026-06-24: THE ARTIST FLOW IS IMPLEMENTED
> The artist `DRAFT → PENDING_APPROVAL → APPROVED/REJECTED` workflow this plan describes now works end-to-end: backend `POST /artist/profile/submit` (+ `submitProfileForReview`), admin `POST /admin/user/approve|reject|req-changes`, and frontend `submitArtistForReview()` called at end of onboarding. Approved artists get `marketplace_unlocked = true` and appear in `GET /discover/artists`. **Venues are not yet on this workflow** — `POST /admin/venue/approve` only flips `marketplace_unlocked` (no `approval_status`/pending state). Consolidated state: `../tap-platform/projectUpdate24June.md`.
>
> ## ✅ AUDIT UPDATE — 2026-07-31: Bug 4 ("Show Preview" / hardcoded Figma link) and the Artist Detail suspend gap are also resolved
> **Bug 4** below no longer applies as described: there is no hardcoded Figma URL anywhere in `src/` today. The venue detail page links to `${NEXT_PUBLIC_PLATFORM_URL}/venues/${slug}` (disabled unless the venue is `marketplaceUnlocked`); the artist detail/approval pages mint a real one-time preview link via `POST /admin/artist/:id/preview-token`. Separately, "What Is Built Today" listed Artist Detail's Suspend/Reset Password buttons as having no `onClick` — those are now wired (`suspendUser`/`unsuspendUser`/`unlockUser`/`forgotPassword`), matching the Approval pages' state. See [tap_admin_project_structure.md](tap_admin_project_structure.md) §3 and §7 for current behavior. The rest of this document's backend-side findings (venue approval state, discovery gating) were not re-verified in this pass — check against `tab-be` directly if still relevant.

> **Goal:** Complete the user registration → admin review → public listing workflow across all three codebases so that when an admin approves an artist or venue profile, it becomes visible in the public Artist/Venue Directory.

---

## 1. Current State Summary

### The Intended Workflow
```
User registers on tap-platform
  → verifies email
  → completes profile (artist or venue)
  → submits for review (approvalStatus → PENDING_APPROVAL)
  → appears in admin user list as "not-approved"
Admin opens tap-admin, reviews profile
  → clicks Approve / Reject / Request Changes
  → artist/venue appears (or stays hidden) in public directory
```

### What Is Built Today

| Layer | Component | State |
|---|---|---|
| tap-admin | Artist Approval page (`/admin/users/artistapproval/[id]`) | ✅ Buttons wired — Approve, Decline, Request Changes all call real API |
| tap-admin | Venue Approval page (`/admin/users/venueapproval/[id]`) | ✅ Approve and Reject buttons wired |
| tap-admin | Artist Detail page (`/admin/users/artist/[id]`) | ⚠️ Data works, Suspend/Reset Password buttons have no `onClick` |
| tap-admin | "Show Preview" button (all approval/detail pages) | ❌ Opens hardcoded Figma URL — does not link to real platform profile |
| tap-backend | `POST /v1/admin/user/approve` | ⚠️ Sets `approvalStatus = APPROVED` but does NOT set `marketplace_unlocked = true` |
| tap-backend | `POST /v1/admin/user/reject` | ✅ Sets `approvalStatus = REJECTED` |
| tap-backend | `POST /v1/admin/user/req-changes` | ✅ Sets `approvalStatus = DRAFT` (sends artist back to draft) |
| tap-backend | `POST /v1/admin/venue/approve` | ❌ Only unsuspends user if suspended — no venue-specific approval state |
| tap-backend | `POST /v1/admin/venue/reject` | ❌ Only suspends user — no venue-specific approval state |
| tap-backend | Artist discovery `GET /v1/discovery/artists` | ⚠️ Correctly gates on `approval_status = 'APPROVED'` AND `marketplace_unlocked = true`, but the latter is never set to true |
| tap-backend | Venue discovery `GET /v1/discovery/venues` | ❌ NO approval gate — every venue with a profile is publicly visible |
| tap-platform | Artist Directory | ✅ Calls discovery API which correctly filters approved artists |
| tap-platform | Venue Directory | ❌ Calls discovery API that has no filter — all venues appear |

---

## 2. Root Cause of Each Bug

### Bug 1 — Artists never appear in directory after approval (CRITICAL)
**File:** `tap-backend/tap-backend/src/admin/admin.service.ts` — `approveUser()` (~line 586)

The discovery query requires:
```sql
p.approval_status = 'APPROVED'    -- set by approveUser() ✅
p.marketplace_unlocked = true     -- defaults false, NEVER set anywhere ❌
```

`marketplace_unlocked` defaults to `false` in the `artist_profiles` table and no code anywhere sets it to `true`. Approval sets the `approvalStatus` column correctly but misses the second required flag.

### Bug 2 — Venue approval is a no-op (CRITICAL)
**File:** `tap-backend/tap-backend/src/admin/admin.service.ts` — `approveVenue()` (~line 639)

The venue profile entity has a comment: `// Venues have no approval gate. Profile is live on creation.`  
`venue_profiles` has no `marketplace_unlocked` column and no `approval_status` column.  
The admin "Approve Venue" only unsuspends the user if they happened to be suspended — it does nothing for a fresh registration.

### Bug 3 — All venue profiles are publicly visible (HIGH)
**File:** `tap-backend/tap-backend/src/discovery/discovery.service.ts` — `discoverVenues()` (~line 183)

Venue discovery conditions:
```typescript
const conditions: string[] = ['p.deleted_at IS NULL'];  // only filter!
```
Every venue with a profile that hasn't been soft-deleted appears in the public directory.

### Bug 4 — Show Preview opens Figma prototype (HIGH)
**Files:** All four admin approval/detail pages

Both artist and venue approval pages have:
```typescript
window.open('https://civic-sauna-76601524.figma.site/', '_blank')
```
This should open the real public profile on tap-platform using the artist/venue slug, e.g.:
- `http://localhost:3000/artists/{slug}`
- `http://localhost:3000/venues/{slug}`

The `slug` is stored on both `artist_profiles` and `venue_profiles` but is not currently returned by any admin API response.

### Bug 5 — Suspend button on Artist Detail page has no handler (MEDIUM)
**File:** `tap-admin/src/app/admin/users/artist/[id]/page.tsx`

The Suspend button exists in the UI but has no `onClick`. The backend endpoint `POST /v1/admin/user/suspend` exists.

---

## 3. Implementation Plan

### Step 1 — Backend: Add `marketplace_unlocked` to `venue_profiles`

**New migration file:**
`tap-backend/tap-backend/src/database/migrations/20260608000000-AddVenueMarketplaceUnlocked.ts`

```typescript
// Up: ALTER TABLE venue_profiles ADD COLUMN marketplace_unlocked boolean NOT NULL DEFAULT false;
// Down: ALTER TABLE venue_profiles DROP COLUMN marketplace_unlocked;
```

**Update entity:**
`tap-backend/tap-backend/src/venues/infrastructure/persistence/relational/entities/venue-profile.entity.ts`

Add column:
```typescript
@Column({ type: 'boolean', name: 'marketplace_unlocked', default: false })
marketplaceUnlocked: boolean;
```

---

### Step 2 — Backend: Fix `approveUser()` — set `marketplace_unlocked = true` for artists

**File:** `tap-backend/tap-backend/src/admin/admin.service.ts` — `approveUser()` (~line 596)

```typescript
// Before:
profile.approvalStatus = ArtistApprovalStatusEnum.APPROVED;

// After:
profile.approvalStatus = ArtistApprovalStatusEnum.APPROVED;
profile.marketplaceUnlocked = true;   // unlock for discovery
```

---

### Step 3 — Backend: Fix `approveVenue()` and `rejectVenue()`

**File:** `tap-backend/tap-backend/src/admin/admin.service.ts`

`approveVenue()` — find venue profile, set `marketplaceUnlocked = true`, save:
```typescript
async approveVenue(adminId: string, dto: ApproveUserDto): Promise<{ success: true }> {
  const profile = await this.venueProfileRepo.findOne({ where: { userId: dto.id } });
  if (!profile) throw new NotFoundException('Venue profile not found for this user');
  profile.marketplaceUnlocked = true;
  await this.venueProfileRepo.save(profile);
  return { success: true };
}
```

`rejectVenue()` — ensure `marketplaceUnlocked` stays `false` (it defaults to `false`, so only a save is needed if it was somehow set):
```typescript
async rejectVenue(adminId: string, dto: RejectUserDto): Promise<{ success: true }> {
  const profile = await this.venueProfileRepo.findOne({ where: { userId: dto.id } });
  if (!profile) throw new NotFoundException('Venue profile not found for this user');
  profile.marketplaceUnlocked = false;
  await this.venueProfileRepo.save(profile);
  return { success: true };
}
```

---

### Step 4 — Backend: Add venue approval gate to discovery

**File:** `tap-backend/tap-backend/src/discovery/discovery.service.ts` — `discoverVenues()` (~line 183)

```typescript
// Before:
const conditions: string[] = ['p.deleted_at IS NULL'];

// After:
const conditions: string[] = [
  'p.deleted_at IS NULL',
  'p.marketplace_unlocked = true',   // only show admin-approved venues
];
```

---

### Step 5 — Backend: Add `slug` to admin artist and venue API responses

**File:** `tap-backend/tap-backend/src/admin/admin.service.ts`

Add `slug: string | null` to `AdminArtistDetailResponse` interface.

In `getArtistByUserId()` return:
```typescript
return {
  id: profile.id,
  slug: profile.slug ?? null,    // add this
  hasProfile: true,
  ...
}
```

Also add `slug: string` to `AdminVenueProfileResponse` interface and return it in `getVenueProfile()`.

---

### Step 6 — Admin: Add `NEXT_PUBLIC_PLATFORM_URL` env variable

**File:** `tap-admin/.env.local`

```
NEXT_PUBLIC_PLATFORM_URL=http://localhost:3000
```

---

### Step 7 — Admin: Fix "Show Preview" on Artist pages

**Files:**
- `tap-admin/src/app/admin/users/artist/[id]/page.tsx`
- `tap-admin/src/app/admin/users/artistapproval/[id]/page.tsx`

Replace:
```typescript
window.open('https://civic-sauna-76601524.figma.site/', '_blank')
```

With:
```typescript
window.open(
  `${process.env.NEXT_PUBLIC_PLATFORM_URL}/artists/${data.slug}`,
  '_blank'
)
```

Disable the button (grey out) if `data.slug` is null.

---

### Step 8 — Admin: Fix "Show Preview" on Venue pages

**Files:**
- `tap-admin/src/app/admin/users/venue/[id]/page.tsx`
- `tap-admin/src/app/admin/users/venueapproval/[id]/page.tsx`

Same pattern:
```typescript
window.open(
  `${process.env.NEXT_PUBLIC_PLATFORM_URL}/venues/${data.slug}`,
  '_blank'
)
```

---

### Step 9 — Admin: Wire Suspend button on Artist Detail page

**File:** `tap-admin/src/app/admin/users/artist/[id]/page.tsx`

Add `suspendUser` function to `tap-admin/src/lib/api/admin/artists.ts`:
```typescript
export function suspendArtist(userId: string) {
  return api('/admin/user/suspend', {
    method: 'POST',
    body: JSON.stringify({ id: userId }),
  })
}
```

Wire in page:
```typescript
async function handleSuspend() {
  await suspendArtist(id)
  router.push('/admin/users')
}
```

---

### Step 10 — Admin: Pass `slug` through the BFF routes

**File:** `tap-admin/src/app/api/admin/artist/[id]/route.ts`
**File:** `tap-admin/src/app/api/admin/venue/[id]/route.ts`

The BFF routes proxy the backend response as-is (`return NextResponse.json(data)`), so `slug` will flow through automatically once the backend adds it to the response — no change needed here.

---

## 4. Files to Change

| # | Codebase | File | Change |
|---|---|---|---|
| 1 | tap-backend | `src/database/migrations/20260608000000-AddVenueMarketplaceUnlocked.ts` | NEW — adds `marketplace_unlocked` column to `venue_profiles` |
| 2 | tap-backend | `src/venues/infrastructure/persistence/relational/entities/venue-profile.entity.ts` | Add `marketplaceUnlocked` TypeORM column |
| 3 | tap-backend | `src/admin/admin.service.ts` | `approveUser()`: add `profile.marketplaceUnlocked = true` |
| 4 | tap-backend | `src/admin/admin.service.ts` | `approveVenue()`: rewrite to set `profile.marketplaceUnlocked = true` |
| 5 | tap-backend | `src/admin/admin.service.ts` | `rejectVenue()`: rewrite to set `profile.marketplaceUnlocked = false` |
| 6 | tap-backend | `src/admin/admin.service.ts` | `AdminArtistDetailResponse` interface: add `slug: string \| null` |
| 7 | tap-backend | `src/admin/admin.service.ts` | `AdminVenueProfileResponse` interface: add `slug: string` |
| 8 | tap-backend | `src/admin/admin.service.ts` | `getArtistByUserId()`: include `slug` in return |
| 9 | tap-backend | `src/admin/admin.service.ts` | `getVenueProfile()`: include `slug` in return |
| 10 | tap-backend | `src/discovery/discovery.service.ts` | `discoverVenues()`: add `p.marketplace_unlocked = true` condition |
| 11 | tap-admin | `.env.local` | Add `NEXT_PUBLIC_PLATFORM_URL=http://localhost:3000` |
| 12 | tap-admin | `src/lib/api/admin/artists.ts` | Add `suspendArtist()` function |
| 13 | tap-admin | `src/app/admin/users/artist/[id]/page.tsx` | Wire Suspend button; fix Show Preview URL |
| 14 | tap-admin | `src/app/admin/users/artistapproval/[id]/page.tsx` | Fix Show Preview URL |
| 15 | tap-admin | `src/app/admin/users/venue/[id]/page.tsx` | Fix Show Preview URL; update to use slug |
| 16 | tap-admin | `src/app/admin/users/venueapproval/[id]/page.tsx` | Fix Show Preview URL |

---

## 5. End-to-End Test Checklist

After all changes are deployed:

### Artist Approval Flow
- [ ] Artist registers on tap-platform, verifies email, completes full profile, submits for review
- [ ] Artist appears in admin user list with status `not-approved`
- [ ] Admin clicks artist row → routed to `/admin/users/artistapproval/[id]` (approval page, not detail page)
- [ ] "Show Preview" button opens `http://localhost:3000/artists/{slug}` — artist NOT visible yet (marketplace_unlocked = false)
- [ ] Admin clicks **Approve** → success toast, redirected to user list
- [ ] Artist now appears in `/artists` directory on tap-platform
- [ ] "Show Preview" now shows the public profile correctly

### Artist Rejection / Request Changes
- [ ] Admin clicks **Decline** without feedback → validation error shown
- [ ] Admin enters feedback, clicks **Decline** → artist `approvalStatus = REJECTED`, not visible in directory
- [ ] Admin clicks **Request Changes** without feedback → validation error
- [ ] Admin enters feedback, clicks **Request Changes** → artist `approvalStatus = DRAFT`, not visible in directory

### Venue Approval Flow
- [ ] Venue registers, completes profile
- [ ] Venue does NOT appear in tap-platform `/venues` directory before approval
- [ ] Venue appears in admin with status `not-approved`
- [ ] Admin opens venue approval page, clicks **Approve**
- [ ] Venue now appears in `/venues` directory on tap-platform
- [ ] "Show Preview" opens `http://localhost:3000/venues/{slug}`

### Artist Suspend (from Detail Page)
- [ ] Admin opens active artist detail page (`/admin/users/artist/[id]`)
- [ ] Clicks **Suspend** → artist suspended, admin redirected to user list
- [ ] Artist detail page now shows `suspended` status badge

---

## 6. Out of Scope (Next Phase)

These are NOT included in this implementation and should be tracked separately:

- Email notification to artist/venue on approval/rejection decision
- Admin "Unsuspend" button on artist/venue detail pages
- "Reset Password" button on artist/venue detail pages
- Venue "Request Changes" action (currently only Approve and Reject)
- Audit log entries for approval actions
- Dashboard stat cards showing real counts (currently hardcoded)
- User Management table action buttons (Suspend/Ban/Approve from table rows — currently console.log only)
