import type { Metadata } from 'next'
import ArtistApprovalClient from './ArtistApprovalClient'

export const metadata: Metadata = {
  title: 'Artist Approval — TAP Admin',
}

interface ArtistApprovalPageProps {
  params: Promise<{ id: string }>
}

export default function ArtistApprovalPage({
  params,
}: ArtistApprovalPageProps) {
  return <ArtistApprovalClient params={params} />
}
