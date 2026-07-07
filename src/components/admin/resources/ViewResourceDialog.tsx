'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { Resource, toResourceItemInput } from '@/types/resource'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { resourceSchema, ResourceInput } from '@/lib/schemas/resourceSchema'
import { useResources, useUpdateResources } from '@/hooks/queries/useResources'
import { uploadMedia } from '@/lib/api/media'
import { Upload, ImagePlus } from 'lucide-react'

type Props = {
  onSuccess?: () => any
}

export function ViewResourceDialog({
  open,
  onOpenChange,
  resource,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  resource: Resource
} & Props) {
  const { data: resources = [] } = useResources()
  const updateMutation = useUpdateResources()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResourceInput>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      type: resource.type,
      title: resource.title,
      description: resource.description ?? '',
      category: resource.category ?? '',
      url: resource.url,
    } as any,
  })

  const type = watch('type')
  const url = watch('url')
  const title = watch('title')
  const pdfFile = watch('pdfFile')
  const thumbnailFile = watch('thumbnailFile')

  const embed = useMemo(() => {
    if (type !== 'youtube' || !url) return null

    const id = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
    )?.[1]

    return id ? `https://www.youtube.com/embed/${id}` : null
  }, [type, url])

  const onSubmit = async (data: ResourceInput) => {
    setSubmitError(null)
    try {
      let nextUrl = 'url' in data && data.url ? data.url : resource.url

      if (data.type === 'pdf' && data.pdfFile instanceof File) {
        const media = await uploadMedia(data.pdfFile)
        nextUrl = media.cdnUrl ?? media.storageKey
      }

      let thumbnailUrl = resource.thumbnailUrl ?? undefined
      if (data.thumbnailFile instanceof File) {
        const media = await uploadMedia(data.thumbnailFile)
        thumbnailUrl = media.cdnUrl ?? media.storageKey
      }

      const items = resources.map((r, i) =>
        r.id === resource.id
          ? {
              id: r.id,
              index: i,
              type: data.type,
              title: data.title,
              description: data.description,
              url: nextUrl,
              category: data.category,
              thumbnailUrl,
            }
          : toResourceItemInput(r, i)
      )

      await updateMutation.mutateAsync(items)

      await onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to save changes'
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-6xl w-[60vw] p-0 overflow-hidden rounded-3xl"
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
            <DialogTitle
              style={{
                fontSize: '32px',
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
              }}
            >
              {title}
            </DialogTitle>

            <DialogDescription>
              Add and manage learning resources for artists and venues.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* BODY */}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-10 py-10 grid grid-cols-2 gap-10 max-h-[70vh] overflow-y-auto"
        >
          {/* LEFT - EDIT FORM */}
          <div className="space-y-8">
            {/* TYPE */}
            <div className="space-y-2">
              <label className="text-sm">Type</label>

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
            <div className="space-y-2">
              <label className="text-sm">Title</label>

              <Input
                className="h-12"
                {...register('title')}
                style={{
                  backgroundColor: 'var(--muted)',
                  borderColor: 'var(--border)',
                }}
              />
              {errors.title && (
                <p className="text-xs text-red-400">{errors.title.message}</p>
              )}
            </div>

            {/* CATEGORY */}
            <div className="space-y-2">
              <label className="text-sm">Category</label>

              <Input
                className="h-12"
                placeholder="e.g. Artist Development, Legal & Rights"
                {...register('category')}
                style={{
                  backgroundColor: 'var(--muted)',
                  borderColor: 'var(--border)',
                }}
              />
              {errors.category && (
                <p className="text-xs text-red-400">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-2">
              <label className="text-sm">Description</label>

              <Textarea
                {...register('description')}
                rows={5}
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
              <div className="space-y-2">
                <label className="text-sm">URL</label>

                <Input
                  className="h-12"
                  {...register('url')}
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

            {/* PDF REPLACE */}
            {type === 'pdf' && (
              <div className="space-y-2">
                <label className="text-sm">PDF File</label>

                <label
                  className="border rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <Upload
                    size={24}
                    style={{ color: 'var(--gold)', marginBottom: '8px' }}
                  />

                  <p className="text-sm">
                    {pdfFile?.name ?? 'Click to replace PDF'}
                  </p>

                  <p
                    className="text-xs mt-2"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Leave empty to keep the current file
                  </p>

                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setValue('pdfFile', file, { shouldDirty: true })
                      }
                    }}
                  />
                </label>
              </div>
            )}

            {/* THUMBNAIL REPLACE */}
            {(type === 'website' || type === 'pdf') && (
              <div className="space-y-2">
                <label className="text-sm">Thumbnail (optional)</label>

                <label
                  className="border rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <ImagePlus
                    size={24}
                    style={{ color: 'var(--gold)', marginBottom: '8px' }}
                  />

                  <p className="text-sm">
                    {thumbnailFile?.name ??
                      (resource.thumbnailUrl
                        ? 'Click to replace thumbnail'
                        : 'Click to upload thumbnail image')}
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setValue('thumbnailFile', file, { shouldDirty: true })
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
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: 'var(--gold)',
                  color: 'black',
                }}
              >
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {/* RIGHT - PREVIEW */}
          <div
            className="rounded-3xl border p-6 h-fit"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
            }}
          >
            <p className="text-xs mb-4 text-muted-foreground uppercase tracking-widest">
              Live Preview
            </p>

            {/* YOUTUBE */}
            {type === 'youtube' && embed && (
              <div
                className="rounded-2xl overflow-hidden border"
                style={{ aspectRatio: '16/9' }}
              >
                <iframe src={embed} className="w-full h-full" allowFullScreen />
              </div>
            )}

            {/* WEBSITE */}
            {type === 'website' && (
              <a
                href={url}
                target="_blank"
                className="text-sm underline"
                style={{ color: 'var(--foreground)' }}
              >
                Open Website →
              </a>
            )}

            {/* PDF */}
            {type === 'pdf' && (
              <div
                className="p-6 rounded-2xl border text-center"
                style={{ borderColor: 'var(--border)' }}
              >
                <p className="text-sm">PDF Document</p>
                <p
                  className="text-xs mt-2 break-all"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {pdfFile?.name ?? resource.url}
                </p>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
