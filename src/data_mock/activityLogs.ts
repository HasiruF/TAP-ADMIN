export const activityLogsMock = [
  {
    id: 'log_001',
    userId: 'usr_1001',
    time: new Date('2026-05-20T08:10:00'),
    event: 'login',
    change: 'User logged in from Chrome (Windows)',
  },

  {
    id: 'log_002',
    userId: 'usr_1001',
    time: new Date('2026-05-20T08:25:00'),
    event: 'logout',
    change: 'User logged out',
  },

  {
    id: 'log_003',
    userId: 'usr_1001',
    time: new Date('2026-05-20T08:40:00'),
    event: 'name-change',
    change: 'Stage name updated',
    changeFrom: 'Aria',
    changeTo: 'Aria Stone',
  },

  {
    id: 'log_004',
    userId: 'usr_1001',
    time: new Date('2026-05-20T09:00:00'),
    event: 'profile-update',
    change: 'Fees updated',
    changeFrom: '50 AUD - 200 AUD',
    changeTo: '100 AUD - 500 AUD',
  },

  {
    id: 'log_005',
    userId: 'usr_1001',
    time: new Date('2026-05-20T09:20:00'),
    event: 'media-upload',
    change: 'Uploaded profile image',
  },

  {
    id: 'log_006',
    userId: 'usr_1001',
    time: new Date('2026-05-20T09:45:00'),
    event: 'password-reset',
    change: 'Password reset requested via email',
  },

  {
    id: 'log_007',
    userId: 'usr_1001',
    time: new Date('2026-05-20T10:10:00'),
    event: 'approval',
    change: 'Artist profile approved by admin',
  },

  {
    id: 'log_008',
    userId: 'usr_1001',
    time: new Date('2026-05-20T10:30:00'),
    event: 'suspended',
    change: 'Account suspended due to policy violation',
    changeFrom: 'Active',
    changeTo: 'Suspended',
  },

  {
    id: 'log_009',
    userId: 'usr_1001',
    time: new Date('2026-05-20T10:45:00'),
    event: 'banned',
    change: 'Account permanently banned',
    changeFrom: 'Suspended',
    changeTo: 'Banned',
  },

  {
    id: 'log_010',
    userId: 'usr_1001',
    time: new Date('2026-05-20T11:00:00'),
    event: 'other',
    change: 'Admin note added: profile flagged for review',
  },

  {
    id: 'log_011',
    userId: 'usr_1001',
    time: new Date('2026-05-20T11:15:00'),
    event: 'media-upload',
    change: 'Uploaded performance video',
  },

  {
    id: 'log_012',
    userId: 'usr_1001',
    time: new Date('2026-05-20T11:30:00'),
    event: 'profile-update',
    change: 'Updated genre preferences',
    changeFrom: 'Jazz',
    changeTo: 'Jazz, Electronic',
  },

  {
    id: 'log_013',
    userId: 'usr_1001',
    time: new Date('2026-05-20T11:45:00'),
    event: 'login',
    change: 'Login from mobile device (iOS)',
  },

  {
    id: 'log_014',
    userId: 'usr_1001',
    time: new Date('2026-05-20T12:00:00'),
    event: 'logout',
    change: 'User logged out from session',
  },

  {
    id: 'log_015',
    userId: 'usr_1001',
    time: new Date('2026-05-20T12:15:00'),
    event: 'approval',
    change: 'Profile re-approved after review',
  },
  {
    id: 'log_016',
    userId: 'usr_1001',
    time: new Date('2026-05-20T12:30:00'),
    event: 'profile-update',
    change: 'Long bio updated',
    changeFrom:
      'Aria Stone is an emerging vocalist exploring experimental jazz textures with a focus on emotional improvisation.',
    changeTo:
      'Aria Stone is an experimental vocalist blending jazz, electronic soundscapes, and ambient storytelling to create immersive live performances across international venues.',
  },
]
