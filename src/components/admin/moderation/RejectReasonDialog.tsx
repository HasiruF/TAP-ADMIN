'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reviewNotes: string) => void
  isSubmitting?: boolean
}

export function RejectReasonDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: Props) {
  const [reviewNotes, setReviewNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReviewNotes('')
      setError(null)
    }
    onOpenChange(next)
  }

  const handleConfirm = () => {
    if (!reviewNotes.trim()) {
      setError('Please add a reason for rejecting this content.')
      return
    }
    onConfirm(reviewNotes.trim())
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg w-[92vw] p-0 overflow-hidden rounded-3xl"
        style={{
          backgroundColor: 'var(--card)',
          color: 'var(--foreground)',
          borderColor: 'var(--border)',
        }}
      >
        {/* HEADER */}
        <div
          className="px-10 py-8 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <DialogHeader>
            <p
              className="mb-2"
              style={{
                color: 'var(--muted-foreground)',
                fontSize: '11px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              Moderation Review
            </p>

            <DialogTitle
              style={{
                fontSize: '28px',
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              Reject Content
            </DialogTitle>

            <p
              className="mt-3"
              style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}
            >
              This reason is saved to the review record and helps the team stay
              consistent.
            </p>
          </DialogHeader>
        </div>

        {/* CONTENT AREA */}
        <div className="px-10 py-8">
          <div
            className="rounded-3xl border p-6"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
            }}
          >
            <label
              className="mb-2 block font-semibold"
              style={{
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--muted-foreground)',
              }}
            >
              Review notes
            </label>
            <Textarea
              value={reviewNotes}
              onChange={(e) => {
                setReviewNotes(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Required — explain why this content is being rejected."
              rows={4}
              className="w-full rounded-xl border p-3 text-sm"
              style={{
                backgroundColor: 'var(--muted)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            />
            {error && (
              <p
                className="mt-2 text-sm"
                style={{ color: 'var(--status-banned-text)' }}
              >
                {error}
              </p>
            )}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div
          className="px-10 py-6 border-t flex items-center justify-end gap-3"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--background)',
          }}
        >
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            style={{
              backgroundColor: 'var(--status-banned-bg)',
              color: 'var(--status-banned-text)',
            }}
          >
            {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
