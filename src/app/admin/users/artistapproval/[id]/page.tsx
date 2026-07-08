'use client'
import { useState } from 'react'
import NextImage from 'next/image'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  MapPin,
  Music2,
  Video,
  Share2,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react'
import { useAdminArtist } from '@/hooks/queries/useAdminArtists'
import { approveArtist, rejectArtist } from '@/lib/api/admin/artists'
import { formatPerformanceType } from '@/lib/utils/performanceType'
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
    setBusy(true)
    setActionError(null)
    try {
      await rejectArtist(id, '')
      router.push('/admin/users')
    } catch (e: any) {
      setActionError(e?.message ?? 'Rejection failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <Link
          href="/admin/users"
          className="mb-3 inline-flex items-center gap-1.5 text-sm"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ArrowLeft size={14} />
          Back to User Management
        </Link>
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
            <h2 className="mb-4 text-base font-semibold">Basic Info</h2>
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
          {data.members && data.members.numberOfMembers !== 1 && (
            <section
              className="p-6 rounded-3xl border"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            >
              <h2 className="mb-4 text-base font-semibold">Members</h2>
              <p className="text-sm">
                <strong>Number of Members:</strong>{' '}
                {data.members.numberOfMembers}
              </p>
              <p className="text-sm">
                <strong>Names:</strong> {data.members.memberNames.join(', ')}
              </p>
            </section>
          )}

          {/* INSTRUMENTS */}
          {data.instruments && (
            <section
              className="p-6 rounded-3xl border"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            >
              <h2 className="mb-4 text-base font-semibold">Instruments</h2>
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
            <h2 className="mb-4 text-base font-semibold">Genres & Style</h2>
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
              <p>
                <strong>Performance Type:</strong>{' '}
                {formatPerformanceType(data.genres.performanceType)}
              </p>
              <p>
                <strong>Act Type:</strong>{' '}
                {data.genres.actType?.join(', ') || '-'}
              </p>
              <p>
                <strong>Energy:</strong> {data.genres.energyLevel}
              </p>
            </div>
          </section>

          {/* PICTURE GALLERY */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h2 className="mb-4 text-base font-semibold flex items-center gap-2">
              <ImageIcon size={16} /> Picture Gallery
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
                <p className="text-sm text-muted-foreground">
                  No images uploaded
                </p>
              )}
            </div>
          </section>

          {/* VIDEO GALLERY */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h2 className="mb-4 text-base font-semibold flex items-center gap-2">
              <Video size={16} /> Video Gallery
            </h2>
            {data.media.livePerformance?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-3">Live Performances</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                  {data.media.livePerformance.map((lp: any) => {
                    const embedUrl = isYouTubeUrl(lp.url)
                      ? getYouTubeEmbedUrl(lp.url)
                      : null
                    return (
                      <div
                        key={lp.id}
                        className="relative overflow-hidden rounded-xl border"
                        style={{
                          aspectRatio: '16/9',
                          borderColor: 'var(--border)',
                        }}
                      >
                        {embedUrl ? (
                          <iframe
                            src={embedUrl}
                            title={lp.name || 'Live performance video'}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        ) : (
                          <a
                            href={lp.url}
                            target="_blank"
                            className="w-full h-full flex flex-col items-center justify-center gap-2 text-center px-3"
                            style={{ backgroundColor: 'var(--muted)' }}
                          >
                            <ExternalLink
                              size={20}
                              style={{ color: 'var(--muted-foreground)' }}
                            />
                            <span
                              className="text-xs underline"
                              style={{ color: 'var(--foreground)' }}
                            >
                              {lp.name || lp.url}
                            </span>
                          </a>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </section>

          {/* SOCIAL LINKS */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h2 className="mb-4 text-base font-semibold flex items-center gap-2">
              <Share2 size={16} /> Social Links
            </h2>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Instagram:</strong> {data.media.socialMedia.instagram}
              </p>
              <p>
                <strong>TikTok:</strong> {data.media.socialMedia.tiktok}
              </p>
              <p>
                <strong>YouTube:</strong> {data.media.socialMedia.youtube}
              </p>
              <p>
                <strong>Facebook:</strong> {data.media.socialMedia.facebook}
              </p>
              <p>
                <strong>X:</strong> {data.media.socialMedia.x}
              </p>
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
            <h2 className="mb-4 text-base font-semibold flex items-center gap-2">
              <Music2 size={16} /> Music Links
            </h2>
            <div className="space-y-2 text-sm">
              {data.musicLinks.links.length > 0 ? (
                data.musicLinks.links.map(
                  (l: { id: string; platform: string; url: string }) => (
                    <div key={l.id} className="flex items-center gap-2">
                      <LinkIcon size={12} style={{ color: 'var(--gold)' }} />
                      <strong>{l.platform}:</strong> {l.url}
                    </div>
                  )
                )
              ) : (
                <p className="text-muted-foreground">No music links</p>
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
            <h2 className="mb-4 text-base font-semibold">Booking</h2>
            <p className="text-sm">
              <strong>Fee:</strong> {data.bookingInfo.performanceFee}
            </p>
            <p className="text-sm">
              <strong>Availability:</strong>{' '}
              {data.bookingInfo.availability.join(', ')}
            </p>
            <p className="text-sm">
              <strong>Payment:</strong> {data.bookingInfo.paymentPreferences}
            </p>
            <p className="text-sm">
              <strong>Set Lengths:</strong>{' '}
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
            <h2 className="mb-4 text-base font-semibold">Live Setup</h2>
            <p className="text-sm">
              <strong>Type:</strong> {data.liveSetup.setupType ?? '-'}
            </p>
            <p className="text-sm">
              <strong>Equipment:</strong>{' '}
              {(data.liveSetup.equipment ?? []).join(', ') || '-'}
            </p>
            <p className="text-sm">
              <strong>Tech Rider Tags:</strong>{' '}
              {(data.liveSetup.techRiderTags ?? []).join(', ') || '-'}
            </p>
            <p className="text-sm mt-2">
              <strong>Notes:</strong> {data.liveSetup.technicalNotes}
            </p>
          </section>

          {/* PAST GIGS */}
          {data.pastGigs && data.pastGigs.length > 0 && (
            <section
              className="p-6 rounded-3xl border"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            >
              <h2 className="mb-4 text-base font-semibold">Past Gigs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.pastGigs.map((gig: any) => (
                  <div
                    key={gig.id}
                    className="text-sm border p-3 rounded-xl"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {gig.media && (
                      <div className="relative rounded-lg aspect-video overflow-hidden">
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

                    <div className="mt-3 flex items-center gap-1.5">
                      <MapPin size={12} style={{ color: 'var(--gold)' }} />
                      <span
                        className="font-semibold"
                        style={{
                          fontSize: '10px',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: 'var(--gold)',
                        }}
                      >
                        Venue
                      </span>
                    </div>
                    <p className="font-semibold text-base mt-0.5">
                      {gig.venueName}
                    </p>
                    <p className="mt-1">
                      <span
                        className="font-semibold"
                        style={{
                          fontSize: '10px',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        Performance Date:
                      </span>{' '}
                      <span style={{ color: 'var(--foreground)' }}>
                        {gig.date}
                      </span>
                    </p>

                    {gig.testimonial && (
                      <p
                        className="mt-2 italic"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
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
            <h2 className="mb-6 text-base font-semibold">Approval Decision</h2>

            {actionError && (
              <div className="mb-4 text-sm text-red-400">{actionError}</div>
            )}

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
    </div>
  )
}
