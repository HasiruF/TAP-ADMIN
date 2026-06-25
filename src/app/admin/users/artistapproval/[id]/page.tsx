'use client'
import { useState } from 'react'
import NextImage from 'next/image'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Music2,
  Video,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react'
import { useAdminArtist } from '@/hooks/queries/useAdminArtists'
import {
  approveArtist,
  rejectArtist,
  requestArtistChanges,
} from '@/lib/api/admin/artists'
import { use } from 'react'
import { useRouter } from 'next/navigation'

export default function ArtistApprovalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const { data: artist, isLoading, error } = useAdminArtist(id)
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  if (isLoading) return <div className="p-6">Loading artist...</div>
  if (error || !artist)
    return <div className="text-center py-20">Artist not found</div>

  const data = artist

  const formatSetLength = (minutes: string): string => {
    const map: Record<string, string> = {
      '30': '30 min',
      '45': '45 min',
      '60': '1 hr',
      '90': '1.5 hr',
      '120': '2 hr',
      '150': '2+ hr',
    }
    return map[minutes] ?? `${minutes} min`
  }

  const API_BASE = (
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'
  ).replace('/api/v1', '')
  const resolveImg = (url: string) =>
    url.startsWith('http') ? url : `${API_BASE}${url}`

  const isYouTubeUrl = (url: string) => /youtube\.com|youtu\.be/.test(url)
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
    )?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }

  async function handleApprove() {
    setBusy(true)
    setActionError(null)
    try {
      await approveArtist(id)
      router.push('/admin/users')
    } catch (e: any) {
      setActionError(e?.message ?? 'Approval failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleReject() {
    if (!feedback.trim()) {
      setActionError('Please provide feedback before rejecting.')
      return
    }
    setBusy(true)
    setActionError(null)
    try {
      await rejectArtist(id, feedback)
      router.push('/admin/users')
    } catch (e: any) {
      setActionError(e?.message ?? 'Rejection failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleRequestChanges() {
    if (!feedback.trim()) {
      setActionError('Please provide feedback before requesting changes.')
      return
    }
    setBusy(true)
    setActionError(null)
    try {
      await requestArtistChanges(id, feedback)
      router.push('/admin/users')
    } catch (e: any) {
      setActionError(e?.message ?? 'Request changes failed')
    } finally {
      setBusy(false)
    }
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
          Admin • Artist Approval
        </p>
        <div className="flex items-center gap-5">
          {data.basicInfo.profilePicture && (
            <div
              className="relative shrink-0 overflow-hidden rounded-full border"
              style={{
                width: 96,
                height: 96,
                borderColor: 'var(--border)',
              }}
            >
              <NextImage
                src={resolveImg(data.basicInfo.profilePicture)}
                alt={data.basicInfo.stageName ?? 'Profile picture'}
                fill
                className="object-cover"
              />
            </div>
          )}

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
              <p>
                <strong>Phone Number:</strong> {data.basicInfo.phoneNumber}
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={14} style={{ color: 'var(--gold)' }} />
                {typeof data.basicInfo.location === 'string'
                  ? data.basicInfo.location
                  : (data.basicInfo.location?.city ?? '-')}
              </p>
              <p>
                <strong>Location Regions:</strong>{' '}
                {typeof data.basicInfo.location === 'string'
                  ? '-'
                  : data.basicInfo.location?.regions.join(', ') || '-'}
              </p>
            </div>
            <div
              className="mt-4 text-sm"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {data.basicInfo.shortBio}
            </div>
          </section>

          {/* MEMBERS */}
          {data.members && (
            <section className="p-6 rounded-3xl border">
              <h2 className="mb-4">Members</h2>
              <p className="text-sm">
                Number of Members: {data.members.numberOfMembers}
              </p>
              <p className="text-sm">
                Names: {data.members.memberNames.join(', ')}
              </p>
            </section>
          )}

          {/* INSTRUMENTS */}
          {data.instruments && (
            <section className="p-6 rounded-3xl border">
              <h2 className="mb-4">Instruments</h2>
              <p className="text-sm">
                {data.instruments.instruments.join(', ')}
              </p>
            </section>
          )}

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
              <p>Act Type: {data.genres.actType?.join(', ') || '-'}</p>
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
            {data.media.videoUrl &&
              isYouTubeUrl(data.media.videoUrl) &&
              getYouTubeEmbedUrl(data.media.videoUrl) && (
                <div
                  className="relative rounded-xl overflow-hidden mb-4 border"
                  style={{ aspectRatio: '16/9' }}
                >
                  <iframe
                    src={getYouTubeEmbedUrl(data.media.videoUrl) || ''}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              )}
            {data.media.livePerformance?.length > 0 && (
              <div className="space-y-3 mb-4">
                <h3 className="text-sm font-medium">Live Performances</h3>
                {data.media.livePerformance.map((lp: any) => (
                  <div key={lp.id} className="text-sm flex items-center gap-2">
                    <ExternalLink size={12} />
                    <a href={lp.url} target="_blank" className="underline">
                      {lp.name || lp.url}
                    </a>
                  </div>
                ))}
              </div>
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
              {data.musicLinks.links.length > 0 ? (
                data.musicLinks.links.map(
                  (l: { id: string; platform: string; url: string }) => (
                    <div key={l.id} className="flex items-center gap-2">
                      <LinkIcon size={12} style={{ color: 'var(--gold)' }} />
                      {l.platform}: {l.url}
                    </div>
                  )
                )
              ) : (
                <p className="text-muted-foreground">No music links</p>
              )}
            </div>
          </section>

          {/* BOOKING */}
          <section className="p-6 rounded-3xl border">
            <h2 className="mb-4">Booking</h2>
            <p className="text-sm">Fee: {data.bookingInfo.performanceFee}</p>
            <p className="text-sm">
              Availability: {data.bookingInfo.availability.join(', ')}
            </p>
            <p className="text-sm">
              Payment: {data.bookingInfo.paymentPreferences}
            </p>
            <p className="text-sm">
              Set Lengths:{' '}
              {(data.bookingInfo.setLengths ?? [])
                .map(formatSetLength)
                .join(', ') || '-'}
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
            <p className="text-sm">Type: {data.liveSetup.setupType ?? '-'}</p>
            <p className="text-sm">
              Equipment: {(data.liveSetup.equipment ?? []).join(', ') || '-'}
            </p>
            <p className="text-sm mt-2">{data.liveSetup.technicalNotes}</p>
          </section>

          {/* PAST GIGS */}
          {data.pastGigs && data.pastGigs.length > 0 && (
            <section className="p-6 rounded-3xl border">
              <h2 className="mb-4">Past Gigs</h2>
              <div className="space-y-4">
                {data.pastGigs.map((gig: any) => (
                  <div key={gig.id} className="text-sm border p-3 rounded-xl">
                    <p>
                      <strong>{gig.venueName}</strong>
                    </p>
                    <p>{gig.date}</p>
                    {gig.media && (
                      <div className="relative mt-2 rounded-lg aspect-video overflow-hidden">
                        {/\.(mp4|webm|mov|ogg)(\?|$)/i.test(gig.media) ? (
                          <video
                            src={resolveImg(gig.media)}
                            controls
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <NextImage
                            src={resolveImg(gig.media)}
                            alt="Venue image"
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                    )}
                    {gig.testimonial && (
                      <p className="mt-2 italic text-muted-foreground">
                        &quot;{gig.testimonial}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT — ADMIN APPROVAL PANEL */}
        <div className="space-y-6">
          <div className="space-y-1">
            <Button
              className="w-full"
              disabled
              style={{
                backgroundColor: 'var(--muted)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                opacity: 0.5,
              }}
            >
              <ExternalLink size={14} />
              Show Preview
            </Button>
            <p
              className="text-center text-xs"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Public profile available after approval
            </p>
          </div>

          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h2 className="mb-6">Approval Decision</h2>

            {actionError && (
              <div className="mb-4 text-sm text-red-400">{actionError}</div>
            )}

            <div className="mb-5">
              <label
                className="text-xs uppercase tracking-widest mb-2 block"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Write Feedback to User
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Explain what needs to be improved or clarified..."
                className="w-full min-h-[140px] p-3 rounded-2xl outline-none resize-none"
                style={{
                  backgroundColor: 'var(--muted)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                }}
              />
            </div>

            <div className="mb-5">
              <Button
                className="w-full"
                disabled={busy}
                onClick={handleRequestChanges}
                style={{
                  backgroundColor: 'var(--foreground)',
                  color: 'var(--muted)',
                  border: '1px solid var(--status-warning-bg)',
                }}
              >
                {busy ? 'Sending...' : 'Request Changes'}
              </Button>
            </div>

            <div
              className="p-4 rounded-2xl border"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="w-full"
                  disabled={busy}
                  onClick={handleApprove}
                  style={{
                    backgroundColor: 'var(--status-active-bg)',
                    color: 'var(--status-active-text)',
                  }}
                >
                  {busy ? '...' : 'Approve'}
                </Button>
                <Button
                  className="w-full"
                  disabled={busy}
                  onClick={handleReject}
                  style={{
                    backgroundColor: 'var(--status-banned-bg)',
                    color: 'var(--status-banned-text)',
                  }}
                >
                  {busy ? '...' : 'Decline'}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* PHOTOS */}
      <section
        className="p-6 rounded-3xl border"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <h2 className="mb-4 flex items-center gap-2">
          <ImageIcon size={16} /> Artist Photos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.media.images.length > 0 ? (
            data.media.images.map((img: string, i: number) => (
              <div
                key={i}
                className="relative rounded-xl aspect-square overflow-hidden"
              >
                <NextImage
                  src={resolveImg(img)}
                  alt="Artist photo"
                  fill
                  className="object-cover"
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No images uploaded</p>
          )}
        </div>
      </section>
    </div>
  )
}
