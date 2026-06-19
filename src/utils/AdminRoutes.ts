export function getAdminUserRoute(user: {
  role: string
  status: string
  id: string
}) {
  const role = user.role.toLowerCase()
  const status = user.status.toLowerCase()

  if (role === 'venue') {
    if (status === 'not-approved') {
      return `/admin/users/venueapproval/${user.id}`
    }
    return `/admin/users/venue/${user.id}`
  }

  if (role === 'artist') {
    if (status === 'not-approved') {
      return `/admin/users/artistapproval/${user.id}`
    }
    return `/admin/users/artist/${user.id}`
  }

  return `/admin/users`
}

export function getAdminLogRoute(user: { id: string; name?: string }) {
  return `/admin/log?userId=${user.id}&name=${encodeURIComponent(
    user.name ?? ''
  )}`
}
