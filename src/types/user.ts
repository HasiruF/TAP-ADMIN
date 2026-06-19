export interface FileType {
  id: string
  path: string
}

export interface UserBe {
  id: string
  email: string | null
  firstName: string | null
  lastName: string | null
  role: { id: number; name: string }
  accountStatus: string
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
  LOCKED: 'Suspended',
}

const PROFILE_APPROVAL_STATUS_MAP: Record<string, string> = {
  DRAFT: 'Inactive',
  PENDING_APPROVAL: 'Not-approved',
  APPROVED: 'Active',
  REJECTED: 'Banned',
}

export const mapUserToBe = (user: UserBe): User => {
  const isProfileRole =
    user.role?.name?.toLowerCase() === 'artist' ||
    user.role?.name?.toLowerCase() === 'venue'

  let status: string

  // Account-level suspended/banned/anonymised always takes precedence
  if (user.accountStatus === 'SUSPENDED' || user.accountStatus === 'LOCKED') {
    status = 'Suspended'
  } else if (user.accountStatus === 'ANONYMISED') {
    status = 'Banned'
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
    // Social/Google signups can have null firstName/lastName, which would
    // leave the Name column blank — fall back to email, then id.
    name:
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
