'use client'

import Image from 'next/image'
import { Conversation } from '@/types/conversation'

type Props = {
  conversation: Conversation
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063',
]

const ROLE_LABEL: Record<string, string> = {
  artist: 'Artist',
  venue: 'Venue',
  user: 'User',
}

export function MessageThread({ conversation }: Props) {
  const [first, second] = conversation.participants

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div
        className="p-4 border-b flex items-center justify-between"
        style={{
          borderColor: 'var(--border)',
        }}
      >
        {/* Left side: avatars + names */}
        <div className="flex items-center gap-3">
          <Image
            src={first.avatar || DEFAULT_AVATARS[0]}
            alt={first.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />

          {/* Name + relation */}
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--foreground)',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              {first.name} ({ROLE_LABEL[first.role]}){' '}
              <span style={{ opacity: 0.6 }}>↔</span> {second.name} (
              {ROLE_LABEL[second.role]})
            </h2>

            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Conversation ID: {conversation.id}
            </p>
          </div>

          <Image
            src={second.avatar || DEFAULT_AVATARS[1]}
            alt={second.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((message) => {
          const sender = conversation.participants.find(
            (p) => p.id === message.senderId
          )
          const isFirst = message.senderId === first.id
          const senderLabel = sender?.name ?? 'Unknown'

          return (
            <div
              key={message.id}
              className={`flex ${isFirst ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[70%] px-4 py-3 rounded-2xl text-sm"
                style={{
                  backgroundColor: isFirst ? 'var(--ink)' : 'var(--muted)',
                  color: isFirst ? 'var(--cream)' : 'var(--foreground)',
                  border: isFirst ? 'none' : '1px solid var(--border)',
                }}
              >
                {/* Sender */}
                <div className="flex items-center gap-2 mb-1">
                  <p
                    className="text-[10px] uppercase tracking-widest"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {senderLabel}
                  </p>
                  {message.isDeleted && (
                    <span
                      className="text-[9px] px-2 py-[2px] rounded-full uppercase tracking-widest"
                      style={{
                        backgroundColor: 'rgba(220,38,38,0.1)',
                        color: '#dc2626',
                      }}
                    >
                      Deleted by user
                    </span>
                  )}
                </div>

                {/* MESSAGE — full content is always shown to admins for
                    moderation, even after the user-facing delete; the badge
                    above is the only indicator it was removed from their view. */}
                <p className="text-sm">{message.content}</p>

                {/* ATTACHMENTS */}
                {(message.attachments?.length ?? 0) > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.attachments?.map((a) => (
                      <div key={a.id} className="mt-2 space-y-2">
                        {/* IMAGE */}
                        {a.type === 'IMAGE' && (
                          <div className="relative w-60 h-60 rounded-lg overflow-hidden">
                            <Image
                              src={a.url}
                              alt={a.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        {/* PDF */}
                        {a.type === 'PDF' && (
                          <a
                            href={a.url}
                            target="_blank"
                            className="text-xs underline flex items-center gap-2"
                            style={{ color: 'var(--gold)' }}
                          >
                            {a.name}
                          </a>
                        )}

                        {/* LINK */}
                        {a.type === 'LINK' && (
                          <a
                            href={a.url}
                            target="_blank"
                            className="text-xs underline flex items-center gap-2"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {a.name || a.url}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div
                  className="mt-2 flex items-center gap-2 text-[10px]"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {new Date(message.timestamp).toLocaleString([], {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
