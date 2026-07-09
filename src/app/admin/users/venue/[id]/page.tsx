import type { Metadata } from 'next'
import VenueDetailClient from './VenueDetailClient'

export const metadata: Metadata = {
  title: 'Venue Profile — TAP Admin',
}

interface VenueDetailPageProps {
  params: Promise<{ id: string }>
}

export default function VenueDetailPage({ params }: VenueDetailPageProps) {
  return <VenueDetailClient params={params} />
}
