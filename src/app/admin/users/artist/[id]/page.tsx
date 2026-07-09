import type { Metadata } from 'next'
import ArtistDetailClient from './ArtistDetailClient'

export const metadata: Metadata = {
  title: 'Artist Profile — TAP Admin',
}

interface ArtistDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ArtistDetailPage({ params }: ArtistDetailPageProps) {
  return <ArtistDetailClient params={params} />
}
