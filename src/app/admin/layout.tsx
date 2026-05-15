// src/app/admin/layout.tsx
"use client"
import type { ReactNode } from "react"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin/layout/SideBar"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div
        className="flex min-h-screen w-full"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <SidebarInset
          style={{
            backgroundColor: "var(--background)",
          }}
        >
          <main className="flex-1 p-8 lg:p-10">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}