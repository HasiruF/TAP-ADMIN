import { z } from 'zod'

export const resourceSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('youtube'),
    title: z.string().min(2),
    description: z.string().min(5),
    url: z.url(),
  }),

  z.object({
    type: z.literal('website'),
    title: z.string().min(2),
    description: z.string().min(5),
    url: z.url(),
  }),

  z.object({
    type: z.literal('document'),
    title: z.string().min(2),
    description: z.string().min(5),
    pdfFile: z.any(), // file validation manual
  }),
])

export type ResourceInput = z.infer<typeof resourceSchema>
