'use client'

import { useState } from 'react'
import NextImage from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  MapPin,
  Building2,
  Users,
  Music2,
  Mic2,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react'
import { use } from 'react'
import { useAdminVenue } from '@/hooks/queries/useAdminVenues'
import { approveVenue, rejectVenue } from '@/lib/api/admin/venues'
import { useRouter } from 'next/navigation'
import { formatBudget } from '@/lib/formatters'
export default function VenueApprovalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const { data: venue, isLoading, error } = useAdminVenue(id)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  if (isLoading) return <div className="p-6">Loading venue...</div>
  if (error || !venue)
    return <div className="text-center py-20">Venue not found</div>

  const data = venue

  const API_BASE = (
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'
  ).replace('/api/v1', '')
  const resolveImg = (url: string) =>
    url.startsWith('http') ? url : `${API_BASE}${url}`

  async function handleApprove() {
    setBusy(true)
    setActionError(null)
    try {
      await approveVenue(id)
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
      await rejectVenue(id, '')
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
          Admin • Venue Inspection
        </p>
        <div className="flex items-center gap-5">
          {data.venueDetails.profilePicture && (
            <div
              className="relative shrink-0 overflow-hidden rounded-full border"
              style={{
                width: 96,
                height: 96,
                borderColor: 'var(--border)',
              }}
            >
              <NextImage
                src={resolveImg(data.venueDetails.profilePicture)}
                alt={data.venueDetails.venueName ?? 'Profile picture'}
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
            {data.venueDetails.venueName}
          </h1>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* VENUE DETAILS */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h2 className="mb-4 text-base font-semibold flex items-center gap-2">
              <Building2 size={16} /> Venue Details
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Name:</strong> {data.venueDetails.venueName}
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={14} style={{ color: 'var(--gold)' }} />
                {data.venueDetails.address}, {data.venueDetails.city},{' '}
                {data.venueDetails.state} {data.venueDetails.zipCode}
              </p>
              <p className="mt-3" style={{ color: 'var(--muted-foreground)' }}>
                {data.venueDetails.description}
              </p>
            </div>
          </section>

          {/* CAPACITY + TECH */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h2 className="mb-4 text-base font-semibold flex items-center gap-2">
              <Users size={16} /> Capacity & Stage
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Capacity:</strong>{' '}
                <span style={{ color: 'var(--foreground)' }}>
                  {data.capacitySpecs.capacity}
                </span>
              </p>
              <p>
                <strong>Stage:</strong>{' '}
                {data.capacitySpecs.hasStage ? 'Available' : 'Not Available'}
              </p>
              <p>
                <strong>Stage Size:</strong>{' '}
                {data.capacitySpecs.stageDimensions}
              </p>
              <p>
                <strong>Sound System:</strong>{' '}
                {data.capacitySpecs.soundSystem.join(', ') || 'None listed'}
              </p>
              <p style={{ color: 'var(--muted-foreground)' }}>
                {data.capacitySpecs.soundSystemNotes}
              </p>
            </div>
          </section>

          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h2 className="mb-4 text-base font-semibold">
              Equipment & Support
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Full Band Support:</strong>{' '}
                {data.capacitySpecs.fullBandSupport ? 'Yes' : 'No'}
              </p>
              <p>
                <strong>Audio Mixers:</strong>{' '}
                {data.capacitySpecs.audioMixersAvailable
                  ? 'Available'
                  : 'Not Available'}
              </p>
              <p>
                <strong>Sound Engineer:</strong>{' '}
                {data.capacitySpecs.soundEngineerAvailable
                  ? 'Available'
                  : 'Not Available'}
              </p>
              <p>
                <strong>Production Team:</strong>{' '}
                {data.capacitySpecs.productionTeamAvailable
                  ? 'Available'
                  : 'Not Available'}
              </p>
              <p>
                <strong>Equipment Provided:</strong>{' '}
                {data.capacitySpecs.equipmentProvided.join(', ') || 'None'}
              </p>
              <p>
                <strong>Amenities:</strong>{' '}
                {data.capacitySpecs.amenities?.join(', ') || 'None'}
              </p>
            </div>
          </section>

          {data.venueHistory?.length > 0 && (
            <section
              className="p-6 rounded-3xl border"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            >
              <h2 className="mb-4 text-base font-semibold">
                Past Performances
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.venueHistory.map((event: any) => (
                  <div
                    key={event.id}
                    className="text-sm border p-3 rounded-xl"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {event.media && (
                      <div className="relative rounded-lg aspect-video overflow-hidden">
                        {/\.(mp4|webm|mov|ogg)(\?|$)/i.test(event.media) ? (
                          <video
                            src={resolveImg(event.media)}
                            controls
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <NextImage
                            src={resolveImg(event.media)}
                            alt={event.performanceName || 'Past performance'}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-1.5">
                      <Mic2 size={12} style={{ color: 'var(--gold)' }} />
                      <span
                        className="font-semibold"
                        style={{
                          fontSize: '10px',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: 'var(--gold)',
                        }}
                      >
                        Artist
                      </span>
                    </div>
                    <p className="font-semibold text-base mt-0.5">
                      {event.performanceName}
                    </p>

                    <p
                      className="mt-1"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {event.eventDescription}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* BOOKING PREFERENCES */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h2 className="mb-4 text-base font-semibold flex items-center gap-2">
              <Music2 size={16} /> Booking Preferences
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Event Types:</strong>{' '}
                {data.bookingPreferences.eventTypes.join(', ') || 'None'}
              </p>
              <p>
                <strong>Genres:</strong>{' '}
                {data.bookingPreferences.genres.join(', ') || 'All'}
              </p>
              <p>
                <strong>Pricing Model:</strong>{' '}
                {data.bookingPreferences.pricingModel}
              </p>
              <p>
                <strong>Budget:</strong> {formatBudget(data.bookingPreferences)}
              </p>
              <p style={{ color: 'var(--muted-foreground)' }}>
                {data.bookingPreferences.bookingNotes}
              </p>
            </div>
          </section>
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

      {/* PHOTOS */}
      <section
        className="p-6 rounded-3xl border"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <h2 className="mb-4 text-base font-semibold flex items-center gap-2">
          <ImageIcon size={16} /> Picture Gallery
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.photos?.images?.length > 0 ? (
            data.photos.images.map((img: string, i: number) => (
              <div
                key={i}
                className="relative rounded-xl aspect-square overflow-hidden"
              >
                <NextImage
                  src={resolveImg(img)}
                  alt="Venue photo"
                  fill
                  className="object-cover"
                />
              </div>
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
