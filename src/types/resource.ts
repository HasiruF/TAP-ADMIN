export type ResourceType = 'youtube' | 'website' | 'document'
export interface BaseResource {
  id: string
  type: ResourceType
  title: string
  description: string
}

export interface YoutubeResource extends BaseResource {
  type: 'youtube'
  url: string
}

export interface WebsiteResource extends BaseResource {
  type: 'website'
  url: string
}

export interface DocumentResource extends BaseResource {
  type: 'document'
  fileName: string
  url?: string
}

export type Resource = YoutubeResource | WebsiteResource | DocumentResource
