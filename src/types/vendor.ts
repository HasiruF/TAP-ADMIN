/** Marketplace vendor category — self-referencing, mirrors Genre in tap-backend. */
export interface VendorCategory {
  id: string
  name: string
  slug: string
  parentCategory: VendorCategory | null
  isActive: boolean
  sortOrder: number
}

export interface VendorListingLink {
  label: string
  url: string
}

/** Row shape returned by GET /vendors/listings. */
export interface VendorListing {
  id: string
  name: string
  /** Denormalized primary category — mirrors categories[0], kept for backward compatibility. */
  category: VendorCategory
  /** Full set of subcategories this vendor belongs to — all share one top-level parent. */
  categories: VendorCategory[]
  location: string | null
  bio: string | null
  links: VendorListingLink[]
  discountCode: string | null
  discountDescription: string | null
  isActive: boolean
  sortOrder: number
}

export type VendorPhotoType = 'LOGO' | 'HERO' | 'NORMAL'

/** Row shape returned by GET /vendors/listing-photos. */
export interface VendorListingPhoto {
  id: string
  vendorListing: { id: string }
  mediaAssetId: string
  photoUrl: string | null
  photoType: VendorPhotoType
  caption: string | null
  sortOrder: number
}
