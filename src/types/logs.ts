export type EventType =
  | 'account-created'
  | 'go-live'
  | 'approval'
  | 'rejection'
  | 'profile-picture'
  | 'media-upload'
  | 'media-delete'
  | 'media-accepted'
  | 'media-rejected'
  | 'password-reset'
  | 'suspension'
  | 'account-deleted'
  | 'other'

export interface ActivityLog {
  id: string

  /** The user this entry belongs to (target, falling back to actor). */
  userId: string | null

  /** Who performed the action (the user themselves, or an admin). */
  actorUserId?: string | null
  actorName?: string | null
  actorEmail?: string | null
  actorRole?: string | null

  /** Who the action was performed on. */
  targetId?: string | null
  targetName?: string | null
  targetEmail?: string | null

  time: string | Date

  event: EventType

  /** Raw backend action name, e.g. ADMIN_APPROVED_USER. */
  action?: string

  change: string

  changeFrom?: string | null

  changeTo?: string | null

  metadata?: Record<string, unknown> | null
}
