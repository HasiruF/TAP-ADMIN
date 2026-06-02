'use client'

import { Button } from '@/components/ui/button'
import {
  Ban,
  Shield,
  RefreshCw,
  Globe,
  MapPin,
  Music2,
  Video,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react'
import { ExternalLink } from 'lucide-react'
import { useAdminArtist } from '@/hooks/queries/useAdminArtists'
import { use } from 'react'
export default function ArtistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const { data: artist, isLoading, error } = useAdminArtist(id)

  if (isLoading) {
    return <div className="p-6">Loading artist...</div>
  }

  if (error || !artist) {
    return <div className="text-center py-20">Artist not found</div>
  }

  const data = artist
  const isYouTubeUrl = (url: string) => {
    return /youtube\.com|youtu\.be/.test(url)
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
    )?.[1]

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <p
          className="mb-2"
          style={{
            color: 'var(--muted-foreground)',
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          Admin • Artist Inspection
        </p>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '54px',
            fontWeight: 500,
            color: 'var(--foreground)',
          }}
        >
          {data.basicInfo.stageName}
        </h1>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* BASIC INFO */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h2 className="mb-4">Basic Info</h2>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Stage Name:</strong> {data.basicInfo.stageName}
              </p>
              <p>
                <strong>Artist Type:</strong> {data.basicInfo.artistType}
              </p>

              <p className="flex items-center gap-2">
                <MapPin size={14} style={{ color: 'var(--gold)' }} />
                {typeof data.basicInfo.location === 'string'
                  ? data.basicInfo.location
                  : data.basicInfo.location.city}
              </p>

              <p>
                <strong>Open to Travel:</strong>{' '}
                {data.basicInfo.openToTravel ? 'Yes' : 'No'}
              </p>

              <p>
                <strong>Travel Radius:</strong> {data.basicInfo.travelRadius}
              </p>
            </div>

            <div
              className="mt-4 text-sm"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {data.basicInfo.shortBio}
            </div>

            <div className="mt-4 text-sm">{data.basicInfo.extendedBio}</div>
          </section>

          {/* GENRES */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h2 className="mb-4">Genres & Style</h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {data.genres.genres.map((g: string) => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-full text-xs"
                  style={{
                    backgroundColor: 'var(--muted)',
                    color: 'var(--foreground)',
                  }}
                >
                  {g}
                </span>
              ))}
            </div>

            <div className="text-sm space-y-1">
              <p>Performance Type: {data.genres.performanceType}</p>
              <p>Style: {data.genres.performanceStyle}</p>
              <p>Act Type: {data.genres.actType}</p>
              <p>Energy: {data.genres.energyLevel}</p>
            </div>
          </section>
          {/* MEDIA */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h2 className="mb-4 flex items-center gap-2">
              <Video size={16} /> Media
            </h2>

            {/* Video Preview */}
            {data.media.videoUrl &&
              isYouTubeUrl(data.media.videoUrl) &&
              getYouTubeEmbedUrl(data.media.videoUrl) && (
                <div
                  className="relative rounded-xl overflow-hidden mb-4 border border-white/10"
                  style={{ aspectRatio: '16/9' }}
                >
                  <iframe
                    src={getYouTubeEmbedUrl(data.media.videoUrl) || ''}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

            {/* Video fallback */}
            {!data.media.videoUrl && (
              <p
                className="text-sm mb-3"
                style={{ color: 'var(--muted-foreground)' }}
              >
                No video provided
              </p>
            )}

            <div className="space-y-1 text-sm">
              <p>Instagram: {data.media.socialMedia.instagram}</p>
              <p>TikTok: {data.media.socialMedia.tiktok}</p>
              <p>YouTube: {data.media.socialMedia.youtube}</p>
              <p>Facebook: {data.media.socialMedia.facebook}</p>
              <p>X: {data.media.socialMedia.x}</p>
            </div>
          </section>

          {/* MUSIC LINKS */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h2 className="mb-4 flex items-center gap-2">
              <Music2 size={16} /> Music Links
            </h2>

            <div className="space-y-2 text-sm">
              {data.musicLinks.links.map(
                (l: { id: string; platform: string; url: string }) => (
                  <div key={l.id} className="flex items-center gap-2">
                    <LinkIcon size={12} style={{ color: 'var(--gold)' }} />
                    {l.platform}: {l.url}
                  </div>
                )
              )}
            </div>
          </section>

          {/* BOOKING */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h2 className="mb-4">Booking</h2>

            <p className="text-sm">
              Fee: {data.bookingInfo.feeRange.currency}{' '}
              {data.bookingInfo.feeRange.min} - {data.bookingInfo.feeRange.max}
            </p>

            <p className="text-sm">
              Availability: {data.bookingInfo.availability.join(', ')}
            </p>

            <p className="text-sm">
              Set Lengths: {data.bookingInfo.setLengths.join(', ')}
            </p>
          </section>

          {/* LIVE SETUP */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h2 className="mb-4">Live Setup</h2>

            <p className="text-sm">Type: {data.liveSetup.setupType}</p>
            <p className="text-sm">
              Equipment: {data.liveSetup.equipment.join(', ')}
            </p>
            <p className="text-sm mt-2">{data.liveSetup.technicalNotes}</p>
          </section>
        </div>

        {/* RIGHT — ADMIN ACTIONS */}
        <div className="space-y-6">
          <Button
            className="w-full"
            onClick={() =>
              window.open('https://civic-sauna-76601524.figma.site/', '_blank')
            }
            style={{
              backgroundColor: 'var(--muted)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            }}
          >
            <ExternalLink size={14} />
            Show Preview
          </Button>
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h2 className="mb-6">Admin Actions</h2>

            <div className="space-y-3">
              <Button
                className="w-full"
                style={{
                  backgroundColor: 'var(--status-active-bg)',
                  color: 'var(--status-active-text)',
                }}
              >
                <Shield size={14} />
                Suspend
              </Button>

              <Button
                className="w-full"
                style={{
                  backgroundColor: 'var(--status-banned-bg)',
                  color: 'var(--status-banned-text)',
                }}
              >
                Ban
              </Button>

              <Button
                className="w-full"
                variant="outline"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                <RefreshCw size={14} />
                Reset Password
              </Button>
            </div>
          </section>
        </div>
      </div>
      {/* PHOTOS */}
      <section
        className="p-6 rounded-3xl border"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <h2 className="mb-4 flex items-center gap-2">
          <ImageIcon size={16} /> Artist Photos
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.photos.images.length > 0 ? (
            data.photos.images.map((img: any, i: number) => (
              <img
                key={i}
                src={img.url}
                className="rounded-xl aspect-square object-cover"
              />
            ))
          ) : (
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              No images uploaded
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
