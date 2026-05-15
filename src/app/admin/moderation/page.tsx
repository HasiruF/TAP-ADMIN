"use client"

import { useState } from "react"
import { ModerationQueueTable } from "@/components/admin/moderation/ModerationQueueTable"
import { moderationData } from "@/data_mock/moderation"
import { ModerationPreviewDialog } from "@/components/admin/moderation/ModerationPreviewDialog"

export default function ContentModerationPage() {
    const [selectedItem, setSelectedItem] = useState<any | null>(null)
    const [open, setOpen] = useState(false)
    const handleApprove = (id: string) => {
    console.log("approve", id)
    }

    const handleReject = (id: string) => {
    console.log("reject", id)
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