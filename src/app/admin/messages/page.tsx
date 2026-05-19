"use client"

import { useMemo, useState } from "react"
import { conversationsMock } from "@/data_mock/conversations"
import { MessageThread } from "@/components/admin/messages/MessageThread"

export default function MessagesPage() {
  const [selected, setSelected] = useState(conversationsMock[0])
  const [search, setSearch] = useState("")

  // 🔍 FILTER LOGIC
  const filteredConversations = useMemo(() => {
    return conversationsMock.filter((conv) => {
      const query = search.toLowerCase()

      const artist = conv.artist.name.toLowerCase()
      const venue = conv.venue.name.toLowerCase()

      return (
        artist.includes(query) ||
        venue.includes(query) ||
        `${artist} ${venue}`.includes(query)
      )
    })
  }, [search])

  return (
    <div className="h-[calc(100vh-80px)] flex gap-6">

      {/* LEFT PANEL */}
      <div
        className="w-[360px] border rounded-2xl flex flex-col"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        {/* 🔍 SEARCH BAR */}
        <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search artist or venue..."
            className="w-full px-3 py-2 rounded-xl outline-none"
            style={{
              backgroundColor: "var(--muted)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            }}
          />
        </div>

        {/* CONVERSATION LIST */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div
              className="p-4 text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              No conversations found
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelected(conv)}
                className="w-full text-left p-4 transition hover:bg-[rgba(255,255,255,0.04)]"
                style={{
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <p
                  style={{
                    color: "var(--foreground)",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  {conv.artist.name} → {conv.venue.name}
                </p>

                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Last: {conv.messages[conv.messages.length - 1]?.content}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className="flex-1 border rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <MessageThread conversation={selected} />
      </div>
    </div>
  )
}