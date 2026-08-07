'use client'

import { useMemo, useState } from 'react'
import {
  Plus,
  MoreVertical,
  Pencil,
  Image as ImageIcon,
  Trash2,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useVendorCategories } from '@/hooks/queries/useVendorCategories'
import {
  useVendorListings,
  useDeleteVendorListing,
} from '@/hooks/queries/useVendorListings'
import { ListingDialog } from './ListingDialog'
import type { VendorListing } from '@/types/vendor'

const ALL_CATEGORIES = '__all__'

/** Top-level category slugs, set by the vendor-category seed — mirrors tap-fe's VendorDirectoryPanel. */
type TypeFilter = 'all' | 'services' | 'products-and-tools' | 'musicians'

const TYPE_FILTERS: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'services', label: 'Service' },
  { id: 'products-and-tools', label: 'Product & Tool' },
  { id: 'musicians', label: 'Session Musicians' },
]

const TYPE_LABEL: Record<Exclude<TypeFilter, 'all'>, string> = {
  services: 'Service',
  'products-and-tools': 'Product & Tool',
  musicians: 'Session Musicians',
}

const TYPE_COLORS: Record<
  Exclude<TypeFilter, 'all'>,
  { bg: string; text: string; border: string }
> = {
  services: {
    bg: 'rgba(174,190,221,0.18)',
    text: '#3c4f78',
    border: 'rgba(174,190,221,0.5)',
  },
  'products-and-tools': {
    bg: 'rgba(159,209,196,0.18)',
    text: '#2f6a5c',
    border: 'rgba(159,209,196,0.5)',
  },
  musicians: {
    bg: 'rgba(201,168,76,0.16)',
    text: '#8a6d1f',
    border: 'rgba(201,168,76,0.5)',
  },
}

/** A vendor's categories all share one top-level parent — a category with
 * no parent of its own (e.g. Musicians) is its own type. */
function vendorTypeSlug(listing: VendorListing): Exclude<TypeFilter, 'all'> {
  const primary = listing.categories?.[0] ?? listing.category
  const slug = primary?.parentCategory?.slug ?? primary?.slug
  return slug === 'products-and-tools' || slug === 'musicians'
    ? slug
    : 'services'
}

function TypeBadge({ listing }: { listing: VendorListing }) {
  const type = vendorTypeSlug(listing)
  const colors = TYPE_COLORS[type]
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {TYPE_LABEL[type]}
    </span>
  )
}

export function ListingsTable() {
  const { data: categories = [] } = useVendorCategories()
  const { data: listings = [], isLoading } = useVendorListings()
  const deleteMutation = useDeleteVendorListing()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTab, setDialogTab] = useState<'details' | 'photos'>('details')
  const [editing, setEditing] = useState<VendorListing | null>(null)

  const subcategories = categories.filter((c) => !!c.parentCategory)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return listings.filter((l) => {
      const matchesSearch = !q || l.name.toLowerCase().includes(q)
      const matchesCategory =
        categoryFilter === ALL_CATEGORIES ||
        (l.categories?.length ? l.categories : [l.category]).some(
          (c) => c.id === categoryFilter
        )
      const matchesType =
        typeFilter === 'all' || vendorTypeSlug(l) === typeFilter
      return matchesSearch && matchesCategory && matchesType
    })
  }, [listings, search, categoryFilter, typeFilter])

  function openCreate() {
    setEditing(null)
    setDialogTab('details')
    setDialogOpen(true)
  }
  function openEdit(listing: VendorListing) {
    setEditing(listing)
    setDialogTab('details')
    setDialogOpen(true)
  }
  function openPhotos(listing: VendorListing) {
    setEditing(listing)
    setDialogTab('photos')
    setDialogOpen(true)
  }
  function handleDelete(listing: VendorListing) {
    if (!window.confirm(`Delete "${listing.name}"?`)) return
    deleteMutation.mutate(listing.id)
  }
  function handleCreated(created: VendorListing) {
    // Keep the dialog open, switch it into edit mode for the vendor that was
    // just saved, and jump to Photos — no need to reopen from the table.
    setEditing(created)
    setDialogTab('photos')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--muted-foreground)' }}
          />
          <Input
            placeholder="Search vendors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            style={{
              backgroundColor: 'var(--muted)',
              borderColor: 'var(--border)',
            }}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger
            className="w-[200px]"
            style={{
              backgroundColor: 'var(--muted)',
              borderColor: 'var(--border)',
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
            {subcategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1.5">
          {TYPE_FILTERS.map((f) => {
            const isActive = typeFilter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setTypeFilter(f.id)}
                className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                style={{
                  border: `1px solid ${isActive ? 'var(--gold)' : 'var(--border)'}`,
                  backgroundColor: isActive
                    ? 'rgba(201,168,76,0.12)'
                    : 'transparent',
                  color: isActive ? 'var(--gold)' : 'var(--muted-foreground)',
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>
        <div className="flex-1" />
        <Button
          onClick={openCreate}
          style={{ backgroundColor: 'var(--gold)', color: 'black' }}
        >
          <Plus size={16} />
          New vendor
        </Button>
      </div>

      <div
        className="relative rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px z-10"
          style={{
            background:
              'linear-gradient(to right, transparent, rgba(201,168,76,0.35), transparent)',
          }}
        />
        <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="text-left p-3" style={{ width: '220px' }}>
                Name
              </th>
              <th className="text-left p-3" style={{ width: '150px' }}>
                Type
              </th>
              <th className="text-left p-3" style={{ width: '180px' }}>
                Category
              </th>
              <th className="text-left p-3" style={{ width: '130px' }}>
                Discount
              </th>
              <th className="text-left p-3" style={{ width: '100px' }}>
                Status
              </th>
              <th className="text-right p-3" style={{ width: '70px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((listing) => (
              <tr
                key={listing.id}
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <td className="p-3 font-medium truncate" title={listing.name}>
                  {listing.name}
                </td>
                <td className="p-3">
                  <TypeBadge listing={listing} />
                </td>
                {(() => {
                  const categoryNames = (
                    listing.categories?.length
                      ? listing.categories
                      : [listing.category]
                  )
                    .map((c) => c.name)
                    .join(', ')
                  return (
                    <td className="p-3 truncate" title={categoryNames}>
                      <Badge variant="outline" className="max-w-full truncate">
                        {categoryNames}
                      </Badge>
                    </td>
                  )
                })()}
                <td className="p-3">
                  {listing.discountCode ? (
                    <span
                      className="font-mono text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: 'rgba(201,168,76,0.12)',
                        color: 'var(--gold)',
                      }}
                    >
                      {listing.discountCode}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--muted-foreground)' }}>—</span>
                  )}
                </td>
                <td className="p-3">
                  <Badge variant={listing.isActive ? 'default' : 'secondary'}>
                    {listing.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(listing)}>
                          <Pencil size={14} />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openPhotos(listing)}>
                          <ImageIcon size={14} />
                          Manage photos
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(listing)}
                          className="text-red-400 focus:text-red-400"
                        >
                          <Trash2 size={14} />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {listings.length === 0
                    ? 'No vendors yet. Create the first one above.'
                    : 'No vendors match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ListingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        listing={editing}
        categories={categories}
        initialTab={dialogTab}
        onCreated={handleCreated}
      />
    </div>
  )
}
