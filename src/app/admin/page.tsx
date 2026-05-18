// src/app/admin/page.tsx

import {
  Music2,
  Building2,
  BadgeCheck,
  Clock3,
} from "lucide-react"
import { GrowthChart } from "@/components/admin/overview/GrowthChart"

const stats = [
  {
    title: "Artists",
    value: "1,284",
    icon: Music2,
  },
  {
    title: "Venues",
    value: "148",
    icon: Building2,
  },
  {
    title: "Pending Artist Approvals",
    value: "23",
    icon: BadgeCheck,
  },
  {
    title: "Pending Venue Approvals",
    value: "11",
    icon: Clock3,
  },
]

export default function AdminOverviewPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
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
          TAP Administration
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
          Overview
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="relative overflow-hidden rounded-2xl border p-5"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            {/* subtle glow */}
            <div
              className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-10"
              style={{
                backgroundColor: "var(--gold)",
              }}
            />

            <div className="relative z-10 flex items-start justify-between">
              {/* LEFT */}
              <div>
                {/* label */}
                <p
                  className="mb-1"
                  style={{
                    color: "var(--muted-foreground)",
                    fontSize: "12px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {stat.title}
                </p>

                {/* number */}
                <h2
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "30px",
                    lineHeight: "1",
                    fontWeight: 500,
                    color: "var(--foreground)",
                  }}
                >
                  {stat.value}
                </h2>
              </div>

              {/* ICON */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(201,168,76,0.08)",
                  border: "1px solid rgba(201,168,76,0.12)",
                }}
              >
                <stat.icon
                  size={18}
                  style={{ color: "var(--gold)" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>  
      <GrowthChart />
    </div>
  )
}