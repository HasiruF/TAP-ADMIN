export async function fetchAdminArtist(id: string) {
  const res = await fetch(`/api/admin/artist/${id}`)

  if (!res.ok) {
    throw new Error('Failed to fetch artist')
  }

  return res.json()
}
