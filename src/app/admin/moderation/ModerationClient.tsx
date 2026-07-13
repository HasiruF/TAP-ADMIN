'use client'

import { useState } from 'react'
import { ModerationQueueTable } from '@/components/admin/moderation/ModerationQueueTable'
import { ModerationPreviewDialog } from '@/components/admin/moderation/ModerationPreviewDialog'
import { useModerationQueue } from '@/hooks/queries/useModerationQueue'
import { useModerationActions } from '@/hooks/queries/useModerationActions'
import { resolveContentUrl } from '@/lib/api/admin/moderation'

export default function ContentModerationPage() {
  const { data: moderationData = [], isLoading, error } = useModerationQueue()

  const tableData = moderationData.map((item) => ({
    id: item.contentModId,
    userId: item.userId ?? '-',
    email: item.email ?? '-',
    name: item.name ?? '-',
    type: item.type,
    role: item.role ?? '-',
    reason: item.reason ?? '-',
    date: item.date,
    content: resolveContentUrl(item.contentLink) ?? '',
  }))
  const { approveModeration, rejectModeration } = useModerationActions()
  const [selectedItem, setSelectedItem] = useState<
    (typeof tableData)[number] | null
  >(null)
  const [open, setOpen] = useState(false)

  const handleReject = (contentModId: string, reviewNotes: string) => {
    rejectModeration({ contentModId, reviewNotes })
  }

  if (isLoading) {
    return <div className="p-6">Loading moderation queue...</div>
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Failed to load moderation data. Please refresh the page or try again
        shortly.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div>
        <p
          className="mb-3"
          style={{
            color: 'var(--muted-foreground)',
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          Platform Management
        </p>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '52px',
            lineHeight: '1',
            fontWeight: 500,
            color: 'var(--foreground)',
          }}
        >
          Content Moderation
        </h1>
      </div>

      <ModerationQueueTable
        data={tableData}
        onApprove={approveModeration}
        onReject={handleReject}
        onRowClick={(item) => {
          setSelectedItem(item)
          setOpen(true)
        }}
      />
      <ModerationPreviewDialog
        open={open}
        onOpenChange={setOpen}
        item={selectedItem}
        onApprove={approveModeration}
        onReject={handleReject}
      />
    </div>
  )
}
