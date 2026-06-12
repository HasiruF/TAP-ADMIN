'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resourceSchema, ResourceInput } from '@/lib/schemas/resourceSchema'
import { toResourceItemInput } from '@/types/resource'
import { useResources, useUpdateResources } from '@/hooks/queries/useResources'
import { uploadMedia } from '@/lib/api/media'

import { Plus, Upload, ImagePlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  onSuccess?: () => any
}

export function CreateResourceDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: resources = [] } = useResources()
  const updateMutation = useUpdateResources()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResourceInput>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      type: 'youtube',
    } as any,
  })
  const handleClose = () => {
    reset({
      type: 'youtube',
      title: '',
      description: '',
      url: '',
    })
    setOpen(false)
  }

  const type = useWatch({
    control,
    name: 'type',
  })
  const pdfFile = watch('pdfFile')
  const thumbnailFile = watch('thumbnailFile')

  const onSubmit = async (data: ResourceInput) => {
    setSubmitError(null)
    try {
      let url = 'url' in data && data.url ? data.url : ''

      if (data.type === 'pdf') {
        if (!(data.pdfFile instanceof File)) {
          setSubmitError('Please upload a PDF file')
          return
        }
        const media = await uploadMedia(data.pdfFile)
        url = media.storageKey
      }

      let thumbnailUrl: string | undefined
      if (data.thumbnailFile instanceof File) {
        const media = await uploadMedia(data.thumbnailFile)
        thumbnailUrl = media.storageKey
      }

      await updateMutation.mutateAsync([
        ...resources.map(toResourceItemInput),
        {
          index: resources.length,
          type: data.type,
          title: data.title,
          description: data.description,
          url,
          category: data.category,
          thumbnailUrl,
        },
      ])
      await onSuccess?.()
      reset({ type: 'youtube' } as any)
      setOpen(false)
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to create resource'
      )
    }
  }

  const handleOpenChange = (v: boolean) => {
    setOpen(v)
    if (!v) {
      setSubmitError(null)
      reset({ type: 'youtube' } as any)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          style={{
            backgroundColor: 'var(--gold)',
            color: 'black',
          }}
        >
          <Plus size={16} />
          Create Resource
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-w-6xl w-[50vw] p-0 overflow-hidden rounded-3xl"
        style={{
          backgroundColor: 'var(--card)',
          color: 'var(--foreground)',
          borderColor: 'var(--border)',
        }}
      >
        {/* HEADER */}
        <div
          className="px-10 py-8 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <DialogHeader>
            <div className="flex items-start justify-between gap-6">
              <div>
                <p
                  className="mb-2"
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: '11px',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                  }}
                >
                  Admin Panel
                </p>

                <DialogTitle
                  style={{
                    fontSize: '32px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  Create Resource
                </DialogTitle>

                <p
                  className="mt-3"
                  style={{
                    color: 'var(--gold)',
                    fontSize: '14px',
                  }}
                >
                  Add learning material for artists & venues
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* CONTENT */}
        <div className="px-2 py-2 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div
              className="rounded-3xl border p-6 space-y-6"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
              }}
            >
              {/* TYPE */}
              <div className="space-y-1">
                <label className="text-sm">Resource Type</label>

                <Select
                  value={type}
                  onValueChange={(v) => setValue('type', v as any)}
                >
                  <SelectTrigger
                    className="h-12"
                    style={{
                      backgroundColor: 'var(--muted)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="pdf">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* TITLE */}
              <div className="space-y-1">
                <label className="text-sm">Title</label>

                <Input
                  className="h-12"
                  placeholder="Enter resource title"
                  style={{
                    backgroundColor: 'var(--muted)',
                    borderColor: 'var(--border)',
                  }}
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-xs text-red-400">{errors.title.message}</p>
                )}
              </div>

              {/* CATEGORY */}
              <div className="space-y-1">
                <label className="text-sm">Category</label>

                <Input
                  className="h-12"
                  placeholder="e.g. Artist Development, Legal & Rights"
                  style={{
                    backgroundColor: 'var(--muted)',
                    borderColor: 'var(--border)',
                  }}
                  {...register('category')}
                />
                {errors.category && (
                  <p className="text-xs text-red-400">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-1">
                <label className="text-sm">Description</label>

                <Textarea
                  {...register('description')}
                  rows={5}
                  placeholder="Describe this resource..."
                  style={{
                    backgroundColor: 'var(--muted)',
                    borderColor: 'var(--border)',
                  }}
                />
                {errors.description && (
                  <p className="text-xs text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* URL */}
              {(type === 'youtube' || type === 'website') && (
                <div className="space-y-1">
                  <label className="text-sm">
                    {type === 'youtube' ? 'YouTube Link' : 'Website URL'}
                  </label>

                  <Input
                    className="h-12"
                    {...register('url')}
                    placeholder="https://..."
                    style={{
                      backgroundColor: 'var(--muted)',
                      borderColor: 'var(--border)',
                    }}
                  />
                  {'url' in errors && errors.url && (
                    <p className="text-xs text-red-400">{errors.url.message}</p>
                  )}
                </div>
              )}

              {/* PDF */}
              {type === 'pdf' && (
                <div className="space-y-1">
                  <label className="text-sm">Upload PDF</label>

                  <label
                    className="border rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <Upload
                      size={30}
                      style={{
                        color: 'var(--gold)',
                        marginBottom: '12px',
                      }}
                    />

                    <p className="text-sm">
                      {pdfFile?.name ?? 'Click to upload PDF'}
                    </p>

                    <p
                      className="text-xs mt-2"
                      style={{
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      PDF only (max recommended 10MB)
                    </p>

                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setValue('pdfFile', file, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                      }}
                    />
                  </label>
                </div>
              )}

              {/* THUMBNAIL (optional — youtube thumbnails are auto-derived) */}
              {(type === 'website' || type === 'pdf') && (
                <div className="space-y-1">
                  <label className="text-sm">Thumbnail (optional)</label>

                  <label
                    className="border rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <ImagePlus
                      size={24}
                      style={{
                        color: 'var(--gold)',
                        marginBottom: '8px',
                      }}
                    />

                    <p className="text-sm">
                      {thumbnailFile?.name ?? 'Click to upload thumbnail image'}
                    </p>

                    <p
                      className="text-xs mt-2"
                      style={{
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      Shown on the resource card. Falls back to an icon if
                      omitted.
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setValue('thumbnailFile', file, {
                            shouldDirty: true,
                          })
                        }
                      }}
                    />
                  </label>
                </div>
              )}

              {submitError && (
                <p className="text-sm text-red-400">{submitError}</p>
              )}

              {/* ACTIONS */}
              <div className="flex justify-end gap-2 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: 'var(--gold)',
                    color: 'black',
                  }}
                >
                  {isSubmitting ? 'Creating…' : 'Create Resource'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
