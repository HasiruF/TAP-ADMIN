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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="relative overflow-hidden rounded-3xl border p-6"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            {/* Glow */}
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10"
              style={{
                backgroundColor: "var(--gold)",
              }}
            />

            <div className="relative z-10">
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  backgroundColor: "rgba(201,168,76,0.10)",
                  border: "1px solid rgba(201,168,76,0.15)",
                }}
              >
                <stat.icon
                  size={22}
                  style={{
                    color: "var(--gold)",
                  }}
                />
              </div>

              {/* Label */}
              <p
                className="mb-2"
                style={{
                  color: "var(--muted-foreground)",
                  fontSize: "13px",
                  letterSpacing: "0.04em",
                }}
              >
                {stat.title}
              </p>

              {/* Number */}
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "54px",
                  lineHeight: "1",
                  fontWeight: 500,
                  color: "var(--foreground)",
                }}
              >
                {stat.value}
              </h2>
            </div>
          </div>
        ))}
      </div>
      <GrowthChart />
    </div>
  )
}