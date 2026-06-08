'use client'

import { useEffect, useState } from 'react'
import { useResources } from '@/hooks/queries/useResources'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useUpdateResources } from '@/hooks/queries/useUpdateResources'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Resource } from '@/types/resource'
import { resourcesMock } from '@/data_mock/resources'
import { CreateResourceDialog } from '@/components/admin/resources/CreateResourceDialog'
import { ViewResourceDialog } from '@/components/admin/resources/ViewResourceDialog'

import SortableRow from './SortableRow'

export default function ResourcesPage() {
  const { data: resources = [] } = useResources()
  const { mutate: updateResources } = useUpdateResources()
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
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [open, setOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragEnd(event: any) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id)
      const newIndex = prev.findIndex((i) => i.id === over.id)

      const newItems = arrayMove(prev, oldIndex, newIndex)

      const payload = newItems.map((item, index) => ({
        ...item,
        index,
      }))

      // sync backend
      updateResources(payload)

      return newItems
    })
  }

  function handleDelete(id: string) {
    setItems((prev) => {
      const newItems = prev.filter((i) => i.id !== id)

      // sync with backend
      updateResources(newItems)

      return newItems
    })
  }

  function handleCreate(data: any) {
    setItems((prev) => {
      const newItem = {
        id: crypto.randomUUID(),
        index: prev.length,
        type: data.type,
        title: data.title,
        description: data.description,
        url: data.url,
      }

      const updated = [...prev, newItem]

      updateResources(updated)

      return updated
    })
  }

  function handleUpdate(id: string, updated: any) {
    console.log('UPDATED OBJECT:', updated)

    setItems((prev) => {
      const newItems = prev.map((item) => {
        return item.id === id ? { ...item, ...updated } : item
      })

      updateResources(newItems)
      return newItems
    })
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

      <CreateResourceDialog onCreate={handleCreate} />

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
            </tbody>
          </table>
        </SortableContext>
      </DndContext>

      {/* GLOBAL DIALOG */}
      {selectedResource && (
        <ViewResourceDialog
          key={selectedResource?.id}
          open={open}
          onOpenChange={setOpen}
          resource={selectedResource}
          onSave={handleUpdate}
        />
      )}
    </div>
  )
}
