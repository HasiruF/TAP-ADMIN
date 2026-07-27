export interface FileType {
  id: string
  path: string
}

export interface UserBe {
  id: string
  email: string | null
  firstName: string | null
  lastName: string | null
  /** Artist stage name / venue name from onboarding, when a profile exists. */
  profileName: string | null
  role: { id: number; name: string }
  accountStatus: string
  deletedAt: string | null
  profileApprovalStatus: string | null
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  joined: string
  lastLogin: string
}

const ACCOUNT_STATUS_MAP: Record<string, string> = {
  ACTIVE: 'Active',
  PENDING_VERIFICATION: 'Not-approved',
  SUSPENDED: 'Suspended',
  ANONYMISED: 'Banned',
  LOCKED: 'Locked',
  DEACTIVATED: 'Deactivated',
}

const PROFILE_APPROVAL_STATUS_MAP: Record<string, string> = {
  DRAFT: 'Inactive',
  PENDING_APPROVAL: 'Not-approved',
  APPROVED: 'Active',
  REJECTED: 'Inactive',
}

export const mapUserToBe = (user: UserBe): User => {
  const isProfileRole =
    user.role?.name?.toLowerCase() === 'artist' ||
    user.role?.name?.toLowerCase() === 'venue'

  let status: string

  // Soft-deleted always wins — the account no longer exists, regardless of
  // whatever accountStatus/profile state it was left in.
  if (user.deletedAt) {
    status = 'Deleted'
  } else if (user.accountStatus === 'SUSPENDED') {
    status = 'Suspended'
  } else if (user.accountStatus === 'LOCKED') {
    status = 'Locked'
  } else if (user.accountStatus === 'ANONYMISED') {
    status = 'Banned'
  } else if (user.accountStatus === 'DEACTIVATED') {
    status = 'Deactivated'
  } else if (user.accountStatus === 'PENDING_VERIFICATION') {
    // Email not yet confirmed — treat same as not-approved regardless of role
    status = 'Not-approved'
  } else if (user.profileApprovalStatus) {
    // Profile exists — derive status from profile approval state
    status =
      PROFILE_APPROVAL_STATUS_MAP[user.profileApprovalStatus] ??
      user.profileApprovalStatus
  } else if (isProfileRole) {
    // Artist/venue with verified account but no profile submitted yet
    status = 'Inactive'
  } else {
    // Admin or other non-profile roles — use account status directly
    status = ACCOUNT_STATUS_MAP[user.accountStatus] ?? user.accountStatus
  }

  return {
    id: user.id,
    // Prefer the artist/venue name from onboarding; fall back to the account
    // holder's name (e.g. Google-auth given/family name), then email, then id
    // for users who have no profile yet.
    name:
      user.profileName ||
      `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
      (user.email ?? '') ||
      user.id,
    email: user.email ?? '',
    role: user.role?.name ?? '',
    status,
    joined: user.createdAt,
    lastLogin: user.lastLoginAt ?? user.updatedAt,
  }
}
