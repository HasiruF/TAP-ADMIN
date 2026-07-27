'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Plus, X, Upload, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { getFriendlyErrorMessage } from '@/lib/api/errorMessage'
import {
  useCreateVendorListing,
  useUpdateVendorListing,
} from '@/hooks/queries/useVendorListings'
import {
  useVendorListingPhotos,
  useCreateVendorListingPhoto,
  useDeleteVendorListingPhoto,
} from '@/hooks/queries/useVendorListingPhotos'
import { uploadMediaAsset } from '@/lib/api/admin/mediaAssets'
import type {
  VendorCategory,
  VendorListing,
  VendorListingLink,
  VendorListingPhoto,
} from '@/types/vendor'

// Without a protocol, "instagram.com" resolves as a path relative to
// whatever page it's rendered on instead of an external link.
function ensureAbsoluteUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

const LINK_LABEL_OPTIONS = [
  'Facebook',
  'Instagram',
  'LinkedIn',
  'TikTok',
  'X',
  'Website',
] as const

const MAX_PHOTOS = 5

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  listing: VendorListing | null
  categories: VendorCategory[]
  onSuccess?: () => unknown
  initialTab?: 'details' | 'photos'
  /** Fired right after a brand-new vendor is saved — lets the caller switch
   * this same dialog into "edit" mode for it instead of closing, so photos
   * can be added immediately without a separate reopen step. */
  onCreated?: (listing: VendorListing) => void
}

export function ListingDialog({
  open,
  onOpenChange,
  listing,
  categories,
  initialTab = 'details',
  onCreated,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl p-0 overflow-hidden"
        style={{
          backgroundColor: 'var(--card)',
          color: 'var(--foreground)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Keyed so switching between "create" / different listings / which
            tab to open on remounts with fresh state instead of syncing via effect. */}
        {open && (
          <ListingForm
            key={`${listing?.id ?? 'new'}-${initialTab}`}
            listing={listing}
            categories={categories}
            initialTab={initialTab}
            onOpenChange={onOpenChange}
            onCreated={onCreated}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function ListingForm({
  listing,
  categories,
  initialTab,
  onOpenChange,
  onCreated,
}: {
  listing: VendorListing | null
  categories: VendorCategory[]
  initialTab: 'details' | 'photos'
  onOpenChange: (open: boolean) => void
  onCreated?: (listing: VendorListing) => void
}) {
  const isEdit = !!listing
  const createMutation = useCreateVendorListing()
  const updateMutation = useUpdateVendorListing()

  const [tab, setTab] = useState<'details' | 'photos'>(initialTab)
  const [name, setName] = useState(listing?.name ?? '')
  const [categoryId, setCategoryId] = useState(listing?.category?.id ?? '')
  const [bio, setBio] = useState(listing?.bio ?? '')
  const [links, setLinks] = useState<VendorListingLink[]>(listing?.links ?? [])
  const [discountCode, setDiscountCode] = useState(listing?.discountCode ?? '')
  const [discountDescription, setDiscountDescription] = useState(
    listing?.discountDescription ?? ''
  )
  const [isActive, setIsActive] = useState(listing?.isActive ?? true)
  const [error, setError] = useState<string | null>(null)

  const subcategories = categories.filter((c) => !!c.parentCategory)
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  function addLink() {
    setLinks((prev) => [...prev, { label: '', url: '' }])
  }
  function updateLink(i: number, patch: Partial<VendorListingLink>) {
    setLinks((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l))
    )
  }
  function removeLink(i: number) {
    setLinks((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!categoryId) {
      setError('Choose a category.')
      return
    }
    const input = {
      name,
      category: { id: categoryId },
      bio: bio || null,
      // Drop rows the admin added but never filled in, and make sure every
      // remaining URL has a protocol — without one, "instagram.com" would
      // render as a link relative to the page it's shown on, not an external site.
      links: links
        .filter((l) => l.url.trim())
        .map((l) => ({ ...l, url: ensureAbsoluteUrl(l.url.trim()) })),
      discountCode: discountCode || null,
      discountDescription: discountDescription || null,
      isActive,
      sortOrder: listing?.sortOrder ?? 0,
    }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: listing.id, input })
        onOpenChange(false)
      } else {
        const created = await createMutation.mutateAsync(input)
        if (onCreated) {
          toast.success('Vendor created — add photos below.')
          onCreated(created)
        } else {
          onOpenChange(false)
        }
      }
    } catch (err) {
      setError(
        getFriendlyErrorMessage(
          err,
          `We couldn't ${isEdit ? 'update' : 'create'} this vendor. Please try again.`
        )
      )
    }
  }

  return (
    <>
      <DialogHeader className="px-6 pt-6">
        <DialogTitle
          style={{ fontFamily: 'var(--font-display)', fontSize: '24px' }}
        >
          {isEdit ? 'Edit vendor' : 'New vendor'}
        </DialogTitle>
      </DialogHeader>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as 'details' | 'photos')}
      >
        <TabsList className="mx-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="photos" disabled={!isEdit}>
            Photos
          </TabsTrigger>
        </TabsList>

        <div className="max-h-[60vh] overflow-y-auto px-6 pb-6">
          <TabsContent value="details">
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm">Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                      backgroundColor: 'var(--muted)',
                      borderColor: 'var(--border)',
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm">Category</label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger
                      style={{
                        backgroundColor: 'var(--muted)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.parentCategory?.name} / {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm">Bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  style={{
                    backgroundColor: 'var(--muted)',
                    borderColor: 'var(--border)',
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm">Links</label>
                {links.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <Select
                      value={link.label}
                      onValueChange={(v) => updateLink(i, { label: v })}
                    >
                      <SelectTrigger
                        className="w-32"
                        style={{
                          backgroundColor: 'var(--muted)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {LINK_LABEL_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="https://…"
                      value={link.url}
                      onChange={(e) => updateLink(i, { url: e.target.value })}
                      style={{
                        backgroundColor: 'var(--muted)',
                        borderColor: 'var(--border)',
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLink(i)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLink}
                >
                  <Plus size={14} />
                  Add link
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm">Discount code</label>
                  <Input
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    style={{
                      backgroundColor: 'var(--muted)',
                      borderColor: 'var(--border)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm">Discount %</label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={discountDescription}
                      onChange={(e) => setDiscountDescription(e.target.value)}
                      className="pr-7"
                      style={{
                        backgroundColor: 'var(--muted)',
                        borderColor: 'var(--border)',
                      }}
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="flex items-center justify-between rounded-lg border p-3"
                style={{ borderColor: 'var(--border)' }}
              >
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Shown to visitors on the Marketplace page
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive((v) => !v)}
                  className="relative w-10 h-6 rounded-full transition-colors"
                  style={{
                    backgroundColor: isActive ? 'var(--gold)' : 'var(--border)',
                  }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                    style={{
                      transform: isActive
                        ? 'translateX(16px)'
                        : 'translateX(0)',
                    }}
                  />
                </button>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: 'var(--gold)', color: 'black' }}
                >
                  {isSubmitting ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="photos" className="pt-4">
            {listing && <PhotosPanel vendorListingId={listing.id} />}
          </TabsContent>
        </div>
      </Tabs>
    </>
  )
}

function PhotoSlot({
  label,
  existing,
  busy,
  onUpload,
  onDelete,
}: {
  label: string
  existing?: VendorListingPhoto
  busy: boolean
  onUpload: () => void
  onDelete: (id: string) => void
}) {
  if (existing) {
    return (
      <div
        className="aspect-square rounded-xl border overflow-hidden relative group"
        style={{ borderColor: 'var(--border)' }}
      >
        {existing.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={existing.photoUrl}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-xs"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Processing…
          </div>
        )}
        <button
          type="button"
          onClick={() => onDelete(existing.id)}
          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff' }}
        >
          <Trash2 size={13} />
        </button>
        <span
          className="absolute bottom-1.5 left-1.5 text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff' }}
        >
          {label}
        </span>
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={onUpload}
      disabled={busy}
      className="aspect-square rounded-xl border border-dashed flex flex-col items-center justify-center gap-1.5 text-center p-2 hover:border-solid transition-all"
      style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
    >
      <Upload size={18} />
      <span className="text-[11px] font-semibold uppercase">{label}</span>
      <span className="text-[10px]">
        {busy ? 'Uploading…' : 'Click to upload'}
      </span>
    </button>
  )
}

function PhotosPanel({ vendorListingId }: { vendorListingId: string }) {
  const { data: photos = [] } = useVendorListingPhotos(vendorListingId)
  const createPhoto = useCreateVendorListingPhoto(vendorListingId)
  const deletePhoto = useDeleteVendorListingPhoto(vendorListingId)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function triggerUpload() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const uploaded = await uploadMediaAsset(file)
      await createPhoto.mutateAsync({
        vendorListing: { id: vendorListingId },
        mediaAssetId: uploaded.id,
        photoType: 'NORMAL',
        sortOrder: photos.length,
      })
    } catch (err) {
      setUploadError(
        getFriendlyErrorMessage(
          err,
          "We couldn't upload that photo. Please try again."
        )
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
        Up to {MAX_PHOTOS} photos. The first photo is used as the vendor&apos;s
        card thumbnail and detail-page banner.
      </p>

      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo) => (
          <PhotoSlot
            key={photo.id}
            label="Photo"
            existing={photo}
            busy={false}
            onUpload={triggerUpload}
            onDelete={(id) => deletePhoto.mutate(id)}
          />
        ))}
        {photos.length < MAX_PHOTOS && (
          <PhotoSlot
            label="Add"
            busy={uploading}
            onUpload={triggerUpload}
            onDelete={(id) => deletePhoto.mutate(id)}
          />
        )}
      </div>

      {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
    </div>
  )
}
