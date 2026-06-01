export type ResourceType = "youtube" | "website" | "document"

export interface Resource {
  id: string
  type: ResourceType
  title: string
  description: string
  url: string
}