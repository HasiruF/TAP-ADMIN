/** Canonical resource type values shared with tap-backend and tap-platform. */
export type ResourceType = 'youtube' | 'website' | 'pdf'

/** Row shape returned by GET /admin/resources. */
export interface Resource {
  id: string
  index: number
  type: ResourceType
  title: string
  description: string | null
  url: string
  category: string | null
  thumbnailUrl: string | null
  createdAt?: string
  updatedAt?: string
}

/** Item shape accepted by PUT /admin/resources (bulk replace). */
export interface ResourceItemInput {
  id?: string
  index: number
  type: ResourceType
  title: string
  description?: string
  url: string
  category?: string
  thumbnailUrl?: string
}

export function toResourceItemInput(
  r: Resource,
  index: number
): ResourceItemInput {
  return {
    id: r.id,
    index,
    type: r.type,
    title: r.title,
    description: r.description ?? undefined,
    url: r.url,
    category: r.category ?? undefined,
    thumbnailUrl: r.thumbnailUrl ?? undefined,
  }
}
