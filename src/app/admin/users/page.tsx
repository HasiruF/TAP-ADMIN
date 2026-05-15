// src/app/admin/users/page.tsx
"use client"
import { UserManagementTable } from "@/components/admin/users/UserManagementTable"

export default function UserManagementPage() {
  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
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
          Platform Management
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
          User Management
        </h1>
      </div>

      <UserManagementTable />
    </div>
  )
}