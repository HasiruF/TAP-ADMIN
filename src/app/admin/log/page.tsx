import type { Metadata } from 'next'
import LogClient from './LogClient'

export const metadata: Metadata = {
  title: 'Activity Logs — TAP Admin',
}

export default function LogsPage() {
  return <LogClient />
}
