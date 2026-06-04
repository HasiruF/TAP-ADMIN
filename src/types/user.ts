export interface FileType {
  id: string
  path: string
}

export interface UserBe {
  id: string

  email: string
  provider: string
  socialId: string | null

  firstName: string
  lastName: string

  photo?: FileType | null

  role: {
    id: number
    name: string
  }

  status: {
    id: number
    name: string
  }

  createdAt: string
  updatedAt: string
  deletedAt: string | null
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

export const mapUserToBe = (user: UserBe): User => ({
  id: user.id,
  name: `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  role: user.role?.name,
  status: user.status?.name,
  joined: user.createdAt,
  lastLogin: user.updatedAt,
})
