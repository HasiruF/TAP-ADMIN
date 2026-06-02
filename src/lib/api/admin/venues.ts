export async function fetchAdminVenue(id: string) {
  const res = await fetch(`/api/admin/venue/${id}`)

  if (!res.ok) {
    throw new Error('Failed to fetch venue')
  }

  return res.json()
}
