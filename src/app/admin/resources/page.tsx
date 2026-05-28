"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import { resourcesMock } from "@/data_mock/resources"
import { CreateResourceDialog } from "@/components/admin/resources/CreateResourceDialog"
import { ViewResourceDialog } from "@/components/admin/resources/ViewResourceDialog"

import SortableRow from "./SortableRow"

export default function ResourcesPage() {
  const [items, setItems] = useState(resourcesMock)

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
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "52px",
          }}
        >
          Resource Management
        </h1>
      </div>

      <CreateResourceDialog />

      {/* TABLE */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>

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
                />
              ))}
            </tbody>

          </table>

        </SortableContext>
      </DndContext>

      {/* GLOBAL DIALOG */}
      {selectedResource && (
        <ViewResourceDialog
          open={open}
          onOpenChange={setOpen}
          resource={selectedResource}
        />
      )}
    </div>
  )
}
