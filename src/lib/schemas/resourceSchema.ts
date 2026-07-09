import { z } from 'zod'

const baseFields = {
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  category: z.string().min(2, 'Category is required'),
  // optional thumbnail image, validated manually (File)
  thumbnailFile: z.any().optional(),
}

export const resourceSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('youtube'),
    ...baseFields,
    url: z.url(),
  }),

  z.object({
    type: z.literal('website'),
    ...baseFields,
    url: z.url(),
  }),

  z.object({
    type: z.literal('pdf'),
    ...baseFields,
    // existing file URL when editing; new uploads validated manually
    url: z.string().optional(),
    pdfFile: z.any().optional(),
  }),
])

export type ResourceInput = z.infer<typeof resourceSchema>
