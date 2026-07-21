'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RejectReasonDialog } from './RejectReasonDialog'

type ModerationItem = {
  id: string
  userId: string
  email: string
  name: string
  type: string
  role?: string
  reason?: string
  date: string
  content: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ModerationItem | null
  onApprove: (id: string) => void
  onReject: (id: string, reviewNotes: string) => void
}

export function ModerationPreviewDialog({
  open,
  onOpenChange,
  item,
  onApprove,
  onReject,
}: Props) {
  const [rejecting, setRejecting] = useState(false)

  if (!item) return null

  const handleApprove = () => {
    onApprove(item.id)
    onOpenChange(false)
  }

  const handleConfirmReject = (reviewNotes: string) => {
    onReject(item.id, reviewNotes)
    onOpenChange(false)
  }

  const renderContent = () => {
    switch (item.type) {
      case 'profile-pic':
      case 'images':
        try {
          const images = JSON.parse(item.content)
          const list = Array.isArray(images) ? images : [item.content]

          return (
            <div className="grid grid-cols-2 gap-3">
              {list.map((img: string, i: number) => (
                <div
                  key={i}
                  className="relative w-full h-40 rounded-xl border overflow-hidden"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <Image
                    src={img}
                    alt={`${item.name} submission ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )
        } catch {
          return (
            <div
              className="relative w-full h-[300px] rounded-xl border overflow-hidden"
              style={{ borderColor: 'var(--border)' }}
            >
              <Image
                src={item.content}
                alt={`${item.name} submission`}
                fill
                className="object-cover"
              />
            </div>
          )
        }

      case 'video':
        // Uploaded media are direct video files; use a native player. Fall back
        // to an iframe for embedded/external URLs (e.g. YouTube).
        if (/youtube|youtu\.be|vimeo|\/embed\//i.test(item.content)) {
          return (
            <iframe
              className="w-full h-[300px] rounded-xl"
              src={item.content}
              allowFullScreen
            />
          )
        }
        return (
          <video
            className="w-full max-h-[300px] rounded-xl"
            src={item.content}
            controls
          />
        )

      case 'social-links':
      case 'music-links':
        try {
          const links: unknown = JSON.parse(item.content)
          return (
            <div className="space-y-2">
              {Array.isArray(links)
                ? (
                    links as Array<{ platform?: string; url: string } | string>
                  ).map((l, i) => (
                    <a
                      key={i}
                      href={typeof l === 'string' ? l : l.url}
                      target="_blank"
                      className="text-sm underline text-blue-400"
                    >
                      {typeof l === 'string' ? l : l.platform || l.url}
                    </a>
                  ))
                : Object.entries(links as Record<string, string>).map(
                    ([k, v]) => (
                      <a
                        key={k}
                        href={v}
                        target="_blank"
                        className="text-sm underline text-blue-400 block"
                      >
                        {k}
                      </a>
                    )
                  )}
            </div>
          )
        } catch {
          return <p>{item.content}</p>
        }

      default:
        return (
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--foreground)' }}
          >
            {item.content}
          </p>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-6xl w-[40vw] p-0 overflow-hidden rounded-3xl"
        style={{
          backgroundColor: 'var(--card)',
          color: 'var(--foreground)',
          borderColor: 'var(--border)',
        }}
      >
        {/* HEADER */}
        <div
          className="px-10 py-8 border-b"
          style={{
            borderColor: 'var(--border)',
          }}
        >
          <DialogHeader>
            <div className="flex items-start justify-between gap-6">
              <div>
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
                    fontSize: '32px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  {item.name}
                </DialogTitle>

                <p
                  className="mt-3 capitalize"
                  style={{
                    color: 'var(--gold)',
                    fontSize: '14px',
                  }}
                >
                  {item.type.replace('-', ' ')}
                </p>
              </div>

              {/* PREVIEW BUTTON — deep-links to the owner's admin profile page */}
              {item.userId && item.userId !== '-' && (
                <a
                  href={`/admin/users/${item.role === 'venue' ? 'venue' : 'artist'}/${item.userId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">View Profile</Button>
                </a>
              )}
            </div>
          </DialogHeader>
        </div>

        {/* CONTENT AREA */}
        <div className="px-10 py-10 max-h-[70vh] overflow-y-auto">
          <div
            className="rounded-3xl border p-8"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
            }}
          >
            {renderContent()}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div
          className="px-10 py-6 border-t flex items-center justify-between"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--background)',
          }}
        >
          {/* META */}
          <div>
            <p
              style={{
                color: 'var(--muted-foreground)',
                fontSize: '13px',
              }}
            >
              Email: {item.email}
            </p>

            <p
              style={{
                color: 'var(--muted-foreground)',
                fontSize: '13px',
                marginTop: '4px',
              }}
            >
              Submitted: {item.date ? String(item.date).slice(0, 10) : '-'}
            </p>

            {item.reason && (
              <p
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: '13px',
                  marginTop: '4px',
                }}
              >
                Reason: {item.reason.replace(/_/g, ' ').toLowerCase()}
              </p>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setRejecting(true)}
              style={{
                borderColor: 'var(--status-banned-text)',
                color: 'var(--status-banned-text)',
              }}
            >
              Reject
            </Button>

            <Button
              onClick={handleApprove}
              style={{
                backgroundColor: 'var(--status-active-bg)',
                color: 'var(--status-active-text)',
              }}
            >
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>

      <RejectReasonDialog
        open={rejecting}
        onOpenChange={setRejecting}
        onConfirm={handleConfirmReject}
      />
    </Dialog>
  )
}
