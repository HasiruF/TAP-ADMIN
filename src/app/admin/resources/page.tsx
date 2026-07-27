import type { Metadata } from 'next'
import ResourcesClient from './ResourcesClient'

export const metadata: Metadata = {
  title: 'Resource Management — TAP Admin',
}

export default function ResourcesPage() {
  return <ResourcesClient />
}
