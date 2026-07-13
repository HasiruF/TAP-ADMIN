'use client'

import { useEffect, useState } from 'react'
import { useResources, useUpdateResources } from '@/hooks/queries/useResources'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Resource, toResourceItemInput } from '@/types/resource'
import { CreateResourceDialog } from '@/components/admin/resources/CreateResourceDialog'
import { ViewResourceDialog } from '@/components/admin/resources/ViewResourceDialog'
import SortableRow from './SortableRow'

export default function ResourcesPage() {
  const { data: resources = [], isLoading, refetch } = useResources()
  const updateMutation = useUpdateResources()

  const [items, setItems] = useState<Resource[]>([])
  // this is needed for rearranging the order. need to sync local state with the query
  useEffect(() => {
    if (!resources?.length) return

    const sorted = [...resources].sort((a, b) => a.index - b.index)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems((prev) => {
      // prevent infinite loop
      const same =
        prev.length === sorted.length &&
        prev.every((p, i) => p.id === sorted[i].id)

      if (same) return prev

      return sorted
    })
  }, [resources])
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  )
  const [open, setOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function persistOrder(next: Resource[]) {
    updateMutation.mutate(next.map(toResourceItemInput))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    let next: Resource[] = []
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id)
      const newIndex = prev.findIndex((i) => i.id === over.id)
      next = arrayMove(prev, oldIndex, newIndex)

      return next
    })
    persistOrder(next)
  }

  function handleDelete(resource: Resource) {
    if (!window.confirm(`Delete "${resource.title}"?`)) return
    const next = items.filter((i) => i.id !== resource.id)
    setItems(next)
    persistOrder(next)
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '52px',
          }}
        >
          Resource Management
        </h1>
      </div>

      <CreateResourceDialog onSuccess={refetch} />

      {/* TABLE */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <table className="w-full text-sm border rounded-2xl overflow-hidden">
            <thead>
              <tr>
                <th></th>
                <th>Type</th>
                <th>Title</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  onView={(res) => {
                    setSelectedResource(res)
                    setOpen(true)
                  }}
                  onDelete={handleDelete}
                />
              ))}
              {!isLoading && items.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No resources yet. Create the first one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>

      {/* GLOBAL DIALOG */}
      {selectedResource && (
        <ViewResourceDialog
          key={selectedResource.id}
          open={open}
          onOpenChange={setOpen}
          resource={selectedResource}
          onSuccess={refetch}
        />
      )}
    </div>
  )
}
