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

export const mapUserToBe = (user: UserBe): User => ({
  id: user.id,
  name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
  email: user.email ?? '',
  role: user.role?.name ?? '',
  status: ACCOUNT_STATUS_MAP[user.accountStatus] ?? user.accountStatus,
  joined: user.createdAt,
  lastLogin: user.lastLoginAt ?? user.updatedAt,
})
