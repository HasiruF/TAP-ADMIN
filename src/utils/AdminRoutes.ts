export function getAdminUserRoute(user: {
  role: "artist" | "venue"
  status: string
}) {
  if (user.role === "venue") {
    if (user.status == "not-approved") {
      return `/admin/users/venueapproval`
    }
    return `/admin/users/venue`
  }

  // artist logic
  if (user.role === "artist") {
    if (user.status == "not-approved") {
      return `/admin/users/artistapproval`
    }
    return `/admin/users/artist`
  }

  // fallback 
  return `/admin/users`
}