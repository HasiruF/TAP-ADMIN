export async function fetchResources() {
  const res = await fetch('/api/admin/resources')

  if (!res.ok) {
    throw new Error('Failed to fetch resources')
  }

  return res.json()
}

export async function updateResources(items: unknown[]) {
  const res = await fetch('/api/admin/resources', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  })

  if (!res.ok) {
    throw new Error('Failed to update resources')
  }

  return res.json()
}
