'use client'

import { Fragment, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  useVendorCategories,
  useDeleteVendorCategory,
} from '@/hooks/queries/useVendorCategories'
import { CategoryDialog } from './CategoryDialog'
import type { VendorCategory } from '@/types/vendor'

export function CategoriesTable() {
  const { data: categories = [], isLoading } = useVendorCategories()
  const deleteMutation = useDeleteVendorCategory()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<VendorCategory | null>(null)

  const topLevel = useMemo(
    () =>
      categories
        .filter((c) => !c.parentCategory)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  )

  const childrenByParent = useMemo(() => {
    const map = new Map<string, VendorCategory[]>()
    for (const c of categories) {
      if (!c.parentCategory) continue
      const list = map.get(c.parentCategory.id) ?? []
      list.push(c)
      map.set(c.parentCategory.id, list)
    }
    for (const list of map.values())
      list.sort((a, b) => a.sortOrder - b.sortOrder)
    return map
  }, [categories])

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }
  function openEdit(c: VendorCategory) {
    setEditing(c)
    setDialogOpen(true)
  }
  function handleDelete(c: VendorCategory) {
    if (!window.confirm(`Delete "${c.name}"?`)) return
    deleteMutation.mutate(c.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {categories.length} categories
        </p>
        <Button
          onClick={openCreate}
          style={{ backgroundColor: 'var(--gold)', color: 'black' }}
        >
          <Plus size={16} />
          New category
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
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {topLevel.map((parent) => (
              <Fragment key={parent.id}>
                <tr style={{ backgroundColor: 'var(--muted)' }}>
                  <td
                    className="p-3 font-medium"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '16px',
                    }}
                  >
                    {parent.name}{' '}
                    <span
                      className="text-xs font-mono"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {(childrenByParent.get(parent.id) ?? []).length}{' '}
                      subcategories
                    </span>
                  </td>
                  <td className="p-3">
                    <Badge variant={parent.isActive ? 'default' : 'secondary'}>
                      {parent.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(parent)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(parent)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
                {(childrenByParent.get(parent.id) ?? []).map((child) => (
                  <tr
                    key={child.id}
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <td className="p-3 pl-8">
                      <div>{child.name}</div>
                      <div
                        className="text-xs font-mono"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {child.slug}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={child.isActive ? 'default' : 'secondary'}>
                        {child.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(child)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(child)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
            {!isLoading && categories.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="p-8 text-center"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  No categories yet. Create the first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
        topLevelCategories={topLevel}
      />
    </div>
  )
}
