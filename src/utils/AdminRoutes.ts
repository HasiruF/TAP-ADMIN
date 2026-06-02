export function getAdminUserRoute(user: {
  role: 'artist' | 'venue'
  status: string
  id: string
}) {
  if (user.role === 'venue') {
    if (user.status == 'not-approved') {
      return `/admin/users/venueapproval/${user.id}`
    }
    return `/admin/users/venue/${user.id}`
  }

  // artist logic
  if (user.role === 'artist') {
    if (user.status == 'not-approved') {
      return `/admin/users/artistapproval/${user.id}`
    }
    return `/admin/users/artist/${user.id}`
  }

  // fallback
  return `/admin/users`
}

export function getAdminLogRoute(user: { role: 'artist' | 'venue' }) {
  if (user.role === 'venue') {
    return `/admin/log`
  }

  if (user.role === 'artist') {
    return `/admin/log`
  }

  return `/admin/log`
}
