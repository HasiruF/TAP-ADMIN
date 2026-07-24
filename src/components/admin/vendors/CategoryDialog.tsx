'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getFriendlyErrorMessage } from '@/lib/api/errorMessage'
import {
  useCreateVendorCategory,
  useUpdateVendorCategory,
} from '@/hooks/queries/useVendorCategories'
import type { VendorCategory } from '@/types/vendor'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: VendorCategory | null
  topLevelCategories: VendorCategory[]
  onSuccess?: () => unknown
}

const NONE_VALUE = '__none__'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  topLevelCategories,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden"
        style={{
          backgroundColor: 'var(--card)',
          color: 'var(--foreground)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Keyed so switching between "create" and different categories
            remounts with fresh initial state instead of syncing via effect. */}
        {open && (
          <CategoryForm
            key={category?.id ?? 'new'}
            category={category}
            topLevelCategories={topLevelCategories}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function CategoryForm({
  category,
  topLevelCategories,
  onOpenChange,
}: {
  category: VendorCategory | null
  topLevelCategories: VendorCategory[]
  onOpenChange: (open: boolean) => void
}) {
  const isEdit = !!category
  const createMutation = useCreateVendorCategory()
  const updateMutation = useUpdateVendorCategory()

  const [name, setName] = useState(category?.name ?? '')
  const [slug, setSlug] = useState(category?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [parentId, setParentId] = useState(
    category?.parentCategory?.id ?? NONE_VALUE
  )
  const [isActive, setIsActive] = useState(category?.isActive ?? true)
  const [sortOrder, setSortOrder] = useState(category?.sortOrder ?? 0)
  const [error, setError] = useState<string | null>(null)

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const input = {
      name,
      slug,
      parentCategory: parentId === NONE_VALUE ? null : { id: parentId },
      isActive,
      sortOrder,
    }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: category.id, input })
      } else {
        await createMutation.mutateAsync(input)
      }
      onOpenChange(false)
    } catch (err) {
      setError(
        getFriendlyErrorMessage(
          err,
          `We couldn't ${isEdit ? 'update' : 'create'} this category. Please try again.`
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
          {isEdit ? 'Edit category' : 'New category'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6 pt-4">
        <div className="space-y-1">
          <label className="text-sm">Name</label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (!slugTouched) setSlug(slugify(e.target.value))
            }}
            required
            style={{
              backgroundColor: 'var(--muted)',
              borderColor: 'var(--border)',
            }}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Slug</label>
          <Input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(e.target.value)
            }}
            required
            style={{
              backgroundColor: 'var(--muted)',
              borderColor: 'var(--border)',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Used in the public URL — lowercase, hyphenated.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm">Parent category</label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger
                style={{
                  backgroundColor: 'var(--muted)',
                  borderColor: 'var(--border)',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>— None (top level) —</SelectItem>
                {topLevelCategories
                  .filter((c) => c.id !== category?.id)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm">Sort order</label>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
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
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
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
                transform: isActive ? 'translateX(16px)' : 'translateX(0)',
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
    </>
  )
}
