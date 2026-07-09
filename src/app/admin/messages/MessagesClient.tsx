'use client'

import { useMemo, useState, useEffect } from 'react'
import { useAdminMessages } from '@/hooks/queries/useAdminMessages'
import { MessageThread } from '@/components/admin/messages/MessageThread'
import { useConversationThread } from '@/hooks/queries/useAdminConversations'
import { Conversation } from '@/types/conversation'
export default function MessagesPage() {
  const { data: raw = [], isLoading, error } = useAdminMessages()

  const conversations = raw.map((c: any) => ({
    id: c.conversationId,
    artistId: c.artistId,
    venueId: c.venueId,
    lastMessageAt: c.lastMessageAt,

    // temporary placeholders
    artist: { name: c.artistId },
    venue: { name: c.venueId },
  }))
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [searchFilter, setSearchFilter] = useState('all')

  const effectiveSelectedId = selectedId || undefined
  const { data: thread } = useConversationThread(effectiveSelectedId)
  const selected = conversations.find((c: any) => c.id === effectiveSelectedId)
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()

    return conversations
      .filter((c: any) => {
        if (!q) return true

        if (searchFilter === 'artist') {
          return c.artist.name.toLowerCase().includes(q)
        }

        if (searchFilter === 'venue') {
          return c.venue.name.toLowerCase().includes(q)
        }

        return (
          c.artist.name.toLowerCase().includes(q) ||
          c.venue.name.toLowerCase().includes(q)
        )
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
      )
  }, [conversations, search, searchFilter])

  const conversation = useMemo(() => {
    if (!selected || !thread) return null

    return {
      id: selected.id,

      artist: {
        id: selected.artistId,
        name: selected.artist.name,
        avatar: selected.artist?.avatar,
      },

      venue: {
        id: selected.venueId,
        name: selected.venue.name,
        avatar: selected.venue?.avatar,
      },

      messages: thread.messages.map((m: any, idx: number) => ({
        id: `${idx}`, // id
        senderId: m.senderId,
        senderRole: m.senderRole,
        content: m.message,
        timestamp: m.timestamp,

        attachments: (m.attachments || []).map((url: string) => ({
          id: url,
          type: 'image', // default assumption
          url,
          name: 'attachment',
        })),
      })),
    }
  }, [selected, thread])

  if (isLoading) return <div className="p-6">Loading messages...</div>

  if (error)
    return (
      <div className="p-6 text-red-500">
        Failed to load messages. Please refresh the page or try again shortly.
      </div>
    )

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
          Message Moderation
        </h1>
      </div>
      <div className="h-[calc(100vh-80px)] flex gap-6">
        {/* LEFT */}
        <div
          className="w-[360px] border rounded-2xl flex flex-col"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          {/* SEARCH */}
          <div
            className="p-3 border-b flex gap-2"
            style={{ borderColor: 'var(--border)' }}
          >
            {/* Dropdown */}
            <select
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="px-3 py-2 rounded-xl"
              style={{
                backgroundColor: 'var(--muted)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              }}
            >
              <option value="all">All</option>
              <option value="artist">Artist</option>
              <option value="venue">Venue</option>
            </select>

            {/* Search Input */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-2 rounded-xl"
              style={{
                backgroundColor: 'var(--muted)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              }}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.map((c: any) => {
              const lastMessageAt = c.lastMessageAt
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className="w-full text-left p-4 transition"
                  style={{
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {/* HEADER ROW */}
                  <div className="flex flex-col gap-2">
                    {/* ARTIST */}
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] px-2 py-[2px] rounded-full"
                        style={{
                          backgroundColor: 'var(--gold)',
                          color: 'var(--background)',
                        }}
                      >
                        Artist
                      </span>

                      <span
                        style={{
                          color: 'var(--foreground)',
                          fontWeight: 500,
                          fontSize: '13px',
                        }}
                      >
                        {c.artist.name}
                      </span>
                    </div>

                    {/* VENUE */}
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] px-2 py-[2px] rounded-full"
                        style={{
                          backgroundColor: 'var(--deep-teal)',
                          color: 'var(--background)',
                        }}
                      >
                        Venue
                      </span>

                      <span
                        style={{
                          color: 'var(--foreground)',

                          fontWeight: 500,
                          fontSize: '13px',
                        }}
                      >
                        {c.venue.name}
                      </span>
                    </div>

                    {/* LAST MESSAGE + TIME */}
                    <div className="flex gap-2 items-center mt-1">
                      <p
                        className="text-xs truncate max-w-[70%]"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        Last Messaged
                      </p>

                      <span
                        className="text-[12px]"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {lastMessageAt
                          ? new Date(lastMessageAt).toLocaleString([], {
                              year: 'numeric',
                              month: 'short',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 border rounded-2xl overflow-hidden">
          {selectedId && !thread ? (
            <div className="p-6">Loading conversation...</div>
          ) : conversation ? (
            <MessageThread conversation={conversation} />
          ) : (
            <div className="p-6 text-sm text-muted-foreground">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
