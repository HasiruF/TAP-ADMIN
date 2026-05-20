"use client"

import { format } from "date-fns"
import { Check, CheckCheck } from "lucide-react"

type Props = {
  conversation: any
}

export function MessageThread({ conversation }: Props) {

  return (
    <div className="h-full flex flex-col">

      {/* HEADER */}
<div
  className="p-4 border-b flex items-center justify-between"
  style={{
    borderColor: "var(--border)",
  }}
>
  {/* Left side: avatars + names */}
  <div className="flex items-center gap-3">
    {/* Artist Avatar */}
    <img
      src={conversation.artist.avatar || "https://images.unsplash.com/photo-1524504388940-b1c1722653e1"}
      alt={conversation.artist.name}
      className="w-10 h-10 rounded-full object-cover"
    />

    {/* Name + relation */}
    <div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--foreground)",
          fontSize: "16px",
          fontWeight: 600,
        }}
      >
        {conversation.artist.name}{" "}
        <span style={{ opacity: 0.6 }}>↔</span>{" "}
        {conversation.venue.name}
      </h2>

      <p
        className="text-xs"
        style={{ color: "var(--muted-foreground)" }}
      >
        Conversation ID: {conversation.id}
      </p>
    </div>

    {/* Venue Avatar */}
    <img
      src={conversation.venue.avatar || "https://images.unsplash.com/photo-1506157786151-b8491531f063"}
      alt={conversation.venue.name}
      className="w-10 h-10 rounded-full object-cover"
    />
  </div>
</div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((message: any) => {
          const isArtist = message.senderId === conversation.artist.id
          const isVenue = message.senderId === conversation.venue.id

          let senderLabel = ""
          if (isArtist) senderLabel = conversation.artist.name
          else if (isVenue) senderLabel = conversation.venue.name
          else senderLabel = "Admin"

          return (
            <div
              key={message.id}
              className={`flex ${isArtist ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[70%] px-4 py-3 rounded-2xl text-sm"
                style={{
                  backgroundColor: isArtist
                    ? "var(--ink)"
                    : "var(--muted)",
                  color: isArtist
                    ? "var(--cream)"
                    : "var(--foreground)",
                  border: isArtist
                    ? "none"
                    : "1px solid var(--border)",
                }}
              >

                {/* Sender */}
                <p
                  className="text-[10px] mb-1 uppercase tracking-widest"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {senderLabel}
                </p>

                {/* MESSAGE */}
                <p className="text-sm">{message.content}</p>

                {/* ATTACHMENTS */}
                {message.attachments?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.attachments?.map((a: any) => (
                      <div key={a.id} className="mt-2 space-y-2">

                        {/* IMAGE */}
                        {a.type === "image" && (
                          <img
                            src={a.url}
                            alt={a.name}
                            className="rounded-lg max-h-[240px] object-cover"
                          />
                        )}

                        {/* VIDEO */}
                        {a.type === "video" && (
                          <video
                            src={a.url}
                            controls
                            className="rounded-lg max-h-[260px] w-full"
                          />
                        )}

                        {/* AUDIO */}
                        {a.type === "audio" && (
                          <audio
                            src={a.url}
                            controls
                            className="w-full"
                          />
                        )}

                        {/* PDF */}
                        {a.type === "pdf" && (
                          <a
                            href={a.url}
                            target="_blank"
                            className="text-xs underline flex items-center gap-2"
                            style={{ color: "var(--gold)" }}
                          >
                            {a.name}
                          </a>
                        )}

                        {/* DOCUMENT */}
                        {a.type === "document" && (
                          <a
                            href={a.url}
                            target="_blank"
                            className="text-xs underline flex items-center gap-2"
                            style={{ color: "var(--foreground)" }}
                          >
                             {a.name}
                          </a>
                        )}

                      </div>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div
                  className="mt-2 flex items-center gap-2 text-[10px]"
                    style={{ color: "var(--muted-foreground)" }}
                    >
                      {new Date(message.timestamp).toLocaleString([], {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
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