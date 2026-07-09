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
  onConfirm: (reason: string) => void
  eyebrow: string
  title: string
  description: string
  confirmLabel: string
  confirmingLabel: string
  confirmColor: { backgroundColor: string; color: string }
  isSubmitting?: boolean
}

export function ReasonPromptDialog({
  open,
  onOpenChange,
  onConfirm,
  eyebrow,
  title,
  description,
  confirmLabel,
  confirmingLabel,
  confirmColor,
  isSubmitting,
}: Props) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReason('')
      setError(null)
    }
    onOpenChange(next)
  }

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('A reason is required — it will be emailed to the user.')
      return
    }
    onConfirm(reason.trim())
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
              {eyebrow}
            </p>

            <DialogTitle
              style={{
                fontSize: '28px',
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              {title}
            </DialogTitle>

            <p
              className="mt-3"
              style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}
            >
              {description}
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
              Reason
            </label>
            <Textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Required — this will be emailed to the user."
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
            style={confirmColor}
          >
            {isSubmitting ? confirmingLabel : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
