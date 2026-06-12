'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Resource } from '@/types/resource'

const TYPE_LABELS: Record<Resource['type'], string> = {
  youtube: 'YouTube',
  website: 'Website',
  pdf: 'Document',
}

export default function SortableRow({
  item,
  onView,
  onDelete,
}: {
  item: Resource
  onView: (item: Resource) => void
  onDelete: (item: Resource) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id })

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="border-b hover:bg-white/5"
    >
      {/* DRAG */}
      <td className="p-3" {...attributes} {...listeners}>
        <GripVertical size={16} />
      </td>

      {/* TYPE */}
      <td className="p-3">{TYPE_LABELS[item.type] ?? item.type}</td>

      {/* TITLE */}
      <td className="p-3">
        <div>{item.title}</div>
        <div className="text-xs opacity-60">{item.description}</div>
      </td>

      {/* ACTIONS */}
      <td className="p-3 text-right">
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => onView(item)}>
            View
          </Button>

          <button
            type="button"
            className="text-red-400 flex items-center gap-1"
            onClick={() => onDelete(item)}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}
