'use client'

import { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import Cropper from 'react-easy-crop'
import { Plus, X, Upload, Trash2, Star } from 'lucide-react'
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
  useUpdateVendorListingPhoto,
  useDeleteVendorListingPhoto,
} from '@/hooks/queries/useVendorListingPhotos'
import { uploadMediaAsset } from '@/lib/api/admin/mediaAssets'
import {
  useAllCities,
  useRegionsByCity,
} from '@/hooks/queries/useReferenceData'
import type {
  VendorCategory,
  VendorListing,
  VendorListingLink,
  VendorListingPhoto,
} from '@/types/vendor'

const LOCATION_CITIES = ['Sydney', 'Brisbane', 'Remote'] as const
type LocationCity = (typeof LOCATION_CITIES)[number]

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

const CROP_ASPECTS = {
  square: 1 / 1,
  portrait: 4 / 5,
  landscape: 16 / 9,
} as const
type CropAspect = keyof typeof CROP_ASPECTS

// Renders the source image + crop rect onto a canvas and returns the result
// as an uploadable File (matches the crop pattern tap-fe uses for venue/
// artist photos, adapted to produce a real File instead of a preview data URL
// since admin uploads go straight to the backend rather than staging locally).
async function getCroppedFile(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  fileName: string
): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.src = imageSrc
    img.onload = () => resolve(img)
    img.onerror = reject
  })

  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.92)
  )
  if (!blob) throw new Error('Failed to crop image')
  return new File([blob], fileName, { type: 'image/jpeg' })
}

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

  // Category selection is two-step: pick a top-level type (Services /
  // Products & Tools / Musicians), then — if that type has subcategories —
  // pick one or more of them. A type with no subcategories (Musicians) uses
  // itself directly as the vendor's only category.
  const initialCategories = listing?.categories?.length
    ? listing.categories
    : listing?.category
      ? [listing.category]
      : []
  const initialTopLevel = initialCategories[0]
    ? (initialCategories[0].parentCategory ?? initialCategories[0])
    : null
  const [topLevelId, setTopLevelId] = useState(initialTopLevel?.id ?? '')
  const [subcategoryIds, setSubcategoryIds] = useState<Set<string>>(
    new Set(
      initialCategories.filter((c) => !!c.parentCategory).map((c) => c.id)
    )
  )

  // Location is a plain string column, but the admin picks it via City
  // buttons (Sydney / Brisbane sourced from the reference-data DB, Remote as
  // a fixed non-geographic option) plus an optional region within that city —
  // same reference data venue onboarding uses. The composed string ("Region,
  // City" or just "City") is what actually gets saved.
  const [location, setLocation] = useState(listing?.location ?? '')
  const activeLocationCity: LocationCity | null = location.startsWith('Remote')
    ? 'Remote'
    : location.includes('Sydney')
      ? 'Sydney'
      : location.includes('Brisbane')
        ? 'Brisbane'
        : null
  const { data: allCities = [] } = useAllCities()
  const activeCityRef = allCities.find(
    (c) => c.slug === activeLocationCity?.toLowerCase()
  )
  const { data: cityRegions = [] } = useRegionsByCity(activeCityRef?.id)
  const locationRegionPart = location.includes(',')
    ? location.split(',')[0].trim()
    : ''
  const selectedRegion = cityRegions.find((r) => r.name === locationRegionPart)
  const remoteNote = location.startsWith('Remote — ')
    ? location.slice('Remote — '.length)
    : ''

  function selectLocationCity(city: LocationCity) {
    setLocation(city)
  }
  function selectLocationRegion(regionId: string) {
    const region = cityRegions.find((r) => r.id === regionId)
    if (region && activeLocationCity) {
      setLocation(`${region.name}, ${activeLocationCity}`)
    }
  }
  function updateRemoteNote(text: string) {
    setLocation(text.trim() ? `Remote — ${text}` : 'Remote')
  }
  const [bio, setBio] = useState(listing?.bio ?? '')
  // Contact email is its own field in the UI (separate from the social-link
  // rows below) but persists as a regular entry in the same `links` array,
  // label 'Email' — reuses the field the backend/frontend already have.
  const [email, setEmail] = useState(
    listing?.links?.find((l) => l.label === 'Email')?.url ?? ''
  )
  const [links, setLinks] = useState<VendorListingLink[]>(
    (listing?.links ?? []).filter((l) => l.label !== 'Email')
  )
  const [discountCode, setDiscountCode] = useState(listing?.discountCode ?? '')
  const [discountDescription, setDiscountDescription] = useState(
    listing?.discountDescription ?? ''
  )
  const [isActive, setIsActive] = useState(listing?.isActive ?? true)
  const [error, setError] = useState<string | null>(null)

  const topLevelCategories = categories.filter((c) => !c.parentCategory)
  const availableSubcategories = categories.filter(
    (c) => c.parentCategory?.id === topLevelId
  )
  const hasSubcategories = availableSubcategories.length > 0
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  function selectTopLevel(id: string) {
    setTopLevelId(id)
    // Previously-selected subcategories belong to the old type — clear them.
    setSubcategoryIds(new Set())
  }
  function toggleSubcategory(id: string) {
    setSubcategoryIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
    if (!topLevelId) {
      setError('Choose a type.')
      return
    }
    const selectedCategoryIds = hasSubcategories
      ? Array.from(subcategoryIds)
      : [topLevelId]
    if (selectedCategoryIds.length === 0) {
      setError('Choose at least one subcategory.')
      return
    }
    const input = {
      name,
      categories: selectedCategoryIds.map((id) => ({ id })),
      location: location.trim() || null,
      bio: bio || null,
      // Drop rows the admin added but never filled in, and make sure every
      // remaining URL has a protocol — without one, "instagram.com" would
      // render as a link relative to the page it's shown on, not an external site.
      links: [
        ...links
          .filter((l) => l.url.trim())
          .map((l) => ({ ...l, url: ensureAbsoluteUrl(l.url.trim()) })),
        ...(email.trim() ? [{ label: 'Email', url: email.trim() }] : []),
      ],
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
                  <label className="text-sm">Type</label>
                  <Select value={topLevelId} onValueChange={selectTopLevel}>
                    <SelectTrigger
                      style={{
                        backgroundColor: 'var(--muted)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <SelectValue placeholder="Choose a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {topLevelCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasSubcategories && (
                <div className="space-y-1.5">
                  <label className="text-sm">Subcategories</label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSubcategories.map((c) => {
                      const isSelected = subcategoryIds.has(c.id)
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleSubcategory(c.id)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                          style={{
                            border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
                            backgroundColor: isSelected
                              ? 'rgba(201,168,76,0.12)'
                              : 'transparent',
                            color: isSelected
                              ? 'var(--gold)'
                              : 'var(--muted-foreground)',
                          }}
                        >
                          {c.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm">Location</label>
                <div className="flex flex-wrap gap-1.5">
                  {LOCATION_CITIES.map((city) => {
                    const isSelected = city === activeLocationCity
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => selectLocationCity(city)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                        style={{
                          border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
                          backgroundColor: isSelected
                            ? 'rgba(201,168,76,0.12)'
                            : 'transparent',
                          color: isSelected
                            ? 'var(--gold)'
                            : 'var(--muted-foreground)',
                        }}
                      >
                        {city}
                      </button>
                    )
                  })}
                </div>

                {(activeLocationCity === 'Sydney' ||
                  activeLocationCity === 'Brisbane') &&
                  cityRegions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cityRegions.map((r) => {
                        const isSelected = r.id === selectedRegion?.id
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => selectLocationRegion(r.id)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                            style={{
                              border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
                              backgroundColor: isSelected
                                ? 'rgba(201,168,76,0.12)'
                                : 'transparent',
                              color: isSelected
                                ? 'var(--gold)'
                                : 'var(--muted-foreground)',
                            }}
                          >
                            {r.name}
                          </button>
                        )
                      })}
                    </div>
                  )}

                {activeLocationCity === 'Remote' && (
                  <Input
                    value={remoteNote}
                    onChange={(e) => updateRemoteNote(e.target.value)}
                    placeholder="Optional note (e.g. Australia-wide)"
                    className="mt-1"
                    style={{
                      backgroundColor: 'var(--muted)',
                      borderColor: 'var(--border)',
                    }}
                  />
                )}
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

              <div className="space-y-1">
                <label className="text-sm">Contact email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendor@example.com"
                  style={{
                    backgroundColor: 'var(--muted)',
                    borderColor: 'var(--border)',
                  }}
                />
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
                  <label className="text-sm">Discount description</label>
                  <Input
                    value={discountDescription}
                    onChange={(e) => setDiscountDescription(e.target.value)}
                    style={{
                      backgroundColor: 'var(--muted)',
                      borderColor: 'var(--border)',
                    }}
                  />
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
  isHero,
  onUpload,
  onDelete,
  onSetHero,
}: {
  label: string
  existing?: VendorListingPhoto
  busy: boolean
  isHero?: boolean
  onUpload: () => void
  onDelete: (id: string) => void
  onSetHero?: (id: string) => void
}) {
  if (existing) {
    return (
      <div
        className={`aspect-square rounded-xl border overflow-hidden relative group ${isHero ? 'ring-2' : ''}`}
        style={{
          borderColor: isHero ? 'var(--gold)' : 'var(--border)',
          ...(isHero ? { boxShadow: '0 0 0 1px var(--gold)' } : {}),
        }}
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
        {isHero && (
          <div
            className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold"
            style={{ backgroundColor: 'var(--gold)', color: 'black' }}
          >
            <Star size={10} strokeWidth={2.5} fill="currentColor" /> Hero
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {!isHero && onSetHero && (
            <button
              type="button"
              onClick={() => onSetHero(existing.id)}
              aria-label="Set as hero photo"
              title="Set as hero photo"
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(13,13,13,0.7)', color: '#fff' }}
            >
              <Star size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(existing.id)}
            aria-label="Delete photo"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
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
  const updatePhoto = useUpdateVendorListingPhoto(vendorListingId)
  const deletePhoto = useDeleteVendorListingPhoto(vendorListingId)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Crop modal state — opened once a file is picked, closed after the
  // cropped result is uploaded (or cancelled).
  const [rawImage, setRawImage] = useState<string | null>(null)
  const [pendingFileName, setPendingFileName] = useState('photo.jpg')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspectType, setAspectType] = useState<CropAspect>('square')
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  function triggerUpload() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPendingFileName(file.name)
    const reader = new FileReader()
    reader.onloadend = () => {
      setRawImage(reader.result as string)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setAspectType('square')
    }
    reader.readAsDataURL(file)
  }

  const onCropComplete = useCallback(
    (
      _: unknown,
      pixels: { x: number; y: number; width: number; height: number }
    ) => setCroppedAreaPixels(pixels),
    []
  )

  async function handleCropSave() {
    if (!rawImage || !croppedAreaPixels) return
    setUploading(true)
    setUploadError(null)
    try {
      const file = await getCroppedFile(
        rawImage,
        croppedAreaPixels,
        pendingFileName
      )
      const uploaded = await uploadMediaAsset(file)
      await createPhoto.mutateAsync({
        vendorListing: { id: vendorListingId },
        mediaAssetId: uploaded.id,
        photoType: 'NORMAL',
        sortOrder: photos.length,
      })
      setRawImage(null)
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

  async function handleSetHero(photoId: string) {
    const currentHero = photos.find(
      (p) => p.photoType === 'HERO' && p.id !== photoId
    )
    if (currentHero) {
      await updatePhoto.mutateAsync({
        id: currentHero.id,
        input: { photoType: 'NORMAL' },
      })
    }
    await updatePhoto.mutateAsync({
      id: photoId,
      input: { photoType: 'HERO' },
    })
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
        Up to {MAX_PHOTOS} photos. Star one to make it the hero — the
        vendor&apos;s card thumbnail and detail-page banner. Without one, the
        first photo is used instead.
      </p>

      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo) => (
          <PhotoSlot
            key={photo.id}
            label="Photo"
            existing={photo}
            busy={false}
            isHero={photo.photoType === 'HERO'}
            onUpload={triggerUpload}
            onDelete={(id) => deletePhoto.mutate(id)}
            onSetHero={handleSetHero}
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

      {rawImage &&
        createPortal(
          // pointerEvents: 'auto' overrides the `pointer-events: none` Radix's
          // DismissableLayer applies to <body> while the parent Dialog is open —
          // without it this portal (a body-level sibling, not inside
          // DialogContent's own subtree) would render on top but be unclickable.
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80"
            style={{ pointerEvents: 'auto' }}
          >
            <div
              className="w-full max-w-lg rounded-2xl p-4 sm:p-6 flex flex-col gap-5 border"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="flex items-center justify-between">
                <h3
                  className="text-lg font-medium"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Crop &amp; adjust
                </h3>
                <button
                  type="button"
                  onClick={() => setRawImage(null)}
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(CROP_ASPECTS) as CropAspect[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setAspectType(type)
                      setCrop({ x: 0, y: 0 })
                      setZoom(1)
                    }}
                    className="py-2 rounded-lg text-[11px] uppercase font-semibold transition-colors"
                    style={{
                      border: `1px solid ${aspectType === type ? 'var(--gold)' : 'var(--border)'}`,
                      backgroundColor:
                        aspectType === type
                          ? 'rgba(201,168,76,0.12)'
                          : 'transparent',
                      color:
                        aspectType === type
                          ? 'var(--gold)'
                          : 'var(--muted-foreground)',
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div
                className="relative w-full rounded-xl overflow-hidden"
                style={{ height: '300px', backgroundColor: '#000' }}
              >
                <Cropper
                  image={rawImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={CROP_ASPECTS[aspectType]}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-current"
                style={{ accentColor: 'var(--gold)' }}
              />

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRawImage(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCropSave}
                  disabled={uploading}
                  style={{ backgroundColor: 'var(--gold)', color: 'black' }}
                >
                  {uploading ? 'Uploading…' : 'Apply crop'}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
