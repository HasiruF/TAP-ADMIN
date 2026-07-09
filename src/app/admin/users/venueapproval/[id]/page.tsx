import type { Metadata } from 'next'
import VenueApprovalClient from './VenueApprovalClient'

export const metadata: Metadata = {
  title: 'Venue Approval — TAP Admin',
}

interface VenueApprovalPageProps {
  params: Promise<{ id: string }>
}

export default function VenueApprovalPage({ params }: VenueApprovalPageProps) {
  return <VenueApprovalClient params={params} />
}
