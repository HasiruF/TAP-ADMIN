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
        className="p-4 border-b"
        style={{
          borderColor: "var(--border)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--foreground)",
            fontSize: "18px",
          }}
        >
          {conversation.artist.name} ↔ {conversation.venue.name}
        </h2>

        <p
          className="text-xs"
          style={{ color: "var(--muted-foreground)" }}
        >
          Conversation ID: {conversation.id}
        </p>
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

                {/* Message */}
                {message.content}

                {/* Footer */}
                <div
                  className="mt-2 flex items-center gap-2 text-[10px]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {format(message.timestamp, "h:mm a")}

                  
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}