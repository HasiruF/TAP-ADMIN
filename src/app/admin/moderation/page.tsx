"use client"

import { useState } from "react"
import { ModerationQueueTable } from "@/components/admin/moderation/ModerationQueueTable"
import { ModerationPreviewDialog } from "@/components/admin/moderation/ModerationPreviewDialog"
import { useModerationQueue } from "@/hooks/queries/useModerationQueue"

export default function ContentModerationPage() {
  const { data: moderationData = [], isLoading, error } = useModerationQueue()

  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [open, setOpen] = useState(false)

  const handleApprove = (id: string) => {
    console.log("approve", id)
  }

  const handleReject = (id: string) => {
    console.log("reject", id)
  }

  if (isLoading) {
    return <div className="p-6">Loading moderation queue...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">Failed to load moderation data</div>
  }

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div>
        <p
          className="mb-3"
          style={{
            color: "var(--muted-foreground)",
            fontSize: "11px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Platform Management
        </p>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "52px",
            lineHeight: "1",
            fontWeight: 500,
            color: "var(--foreground)",
          }}
        >
          Content Moderation
        </h1>
      </div>

      <ModerationQueueTable
        data={moderationData}
        onApprove={handleApprove}
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
        onApprove={handleApprove}
        onReject={handleReject}
        /> 
    </div>
  )
}