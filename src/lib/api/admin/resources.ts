export async function fetchResources() {
  const res = await fetch("/api/admin/resources")

  if (!res.ok) {
    throw new Error("Failed to fetch resources")
  }

  return res.json()
}