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

  userId: string // internal / sql

  time: Date

  event: EventType

  change: string

  changeFrom?: string

  changeTo?: string
}
