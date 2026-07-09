// src/app/admin/page.tsx
import type { Metadata } from 'next'
import OverviewClient from './OverviewClient'

export const metadata: Metadata = {
  title: 'Overview — TAP Admin',
}

export default function AdminOverviewPage() {
  return <OverviewClient />
}
