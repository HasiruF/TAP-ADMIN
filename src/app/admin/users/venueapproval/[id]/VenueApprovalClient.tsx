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
  KeyRound,
  Share2,
} from 'lucide-react'
import { use } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAdminVenue } from '@/hooks/queries/useAdminVenues'
import { approveVenue, rejectVenue } from '@/lib/api/admin/venues'
import { RegionSuggestionsPanel } from '@/components/admin/shared/RegionSuggestionsPanel'
import { forgotPassword } from '@/lib/api/auth'
import { useRouter } from 'next/navigation'
import { formatBudget } from '@/lib/formatters'
import {
  getFriendlyErrorMessage,
  BackendErrorShape,
} from '@/lib/api/errorMessage'

type VenueHistoryEvent = {
  id: string
  media?: string | null
  performanceName?: string | null
  eventDescription?: string | null
}

export default function VenueApprovalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: venue, isLoading, error } = useAdminVenue(id)
  const [busy, setBusy] = useState(false)
  const [resetBusy, setResetBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')

  if (isLoading) return <div className="p-6">Loading venue...</div>
  if (error || !venue) {
    const errorShape = error as BackendErrorShape | null
    const status = errorShape?.statusCode ?? errorShape?.status
    const notFoundMessage =
      status === 404
        ? 'Venue not found'
        : getFriendlyErrorMessage(
            error,
            "We couldn't load this venue. Please try again."
          )
    return <div className="text-center py-20">{notFoundMessage}</div>
  }

  const data = venue

  const formatSetLength = (minutes: number): string => {
    const map: Record<string, string> = {
      '30': '30 min',
      '60': '1 hr',
      '90': '1.5 hr',
      '120': '2 hr',
      '180': '3 hr',
      '210': '3+ hr',
    }
    return map[String(minutes)] ?? `${minutes} min`
  }

  const API_BASE = (
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'
  ).replace('/api/v1', '')
  const resolveImg = (url: string) =>
    url.startsWith('http') ? url : `${API_BASE}${url}`

  // Only invalidate the table's cache here — not this page's own
  // ['admin-venue', id] query. We're navigating away immediately after, so
  // refetching data for a page we're about to abandon just risks a slow or
  // failing refetch delaying (or visibly interrupting) the navigation.
  async function refreshUsersTable() {
    await queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  }

  // Used for in-place updates that stay on this page (e.g. resolving a
  // region suggestion below) — unlike approve/reject, there's no navigation
  // afterward, so refreshing this page's own venue data is exactly what's
  // needed here.
  async function refreshVenue() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-venue', id] }),
      queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
    ])
  }

  async function handleApprove() {
    setBusy(true)
    setActionError(null)
    try {
      await approveVenue(id)
      await refreshUsersTable()
      router.push(`/admin/users/venue/${id}`)
    } catch (e) {
      setActionError(
        getFriendlyErrorMessage(
          e,
          "We couldn't approve this venue. Please try again."
        )
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleReject() {
    if (!feedback.trim()) {
      setActionError(
        'Please add a message explaining the rejection — it will be emailed to the user.'
      )
      return
    }
    setBusy(true)
    setActionError(null)
    try {
      await rejectVenue(id, feedback.trim())
      await refreshUsersTable()
      router.push('/admin/users')
    } catch (e) {
      setActionError(
        getFriendlyErrorMessage(
          e,
          "We couldn't reject this venue. Please try again."
        )
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleResetPassword() {
    if (!data.email) return
    const confirmed = window.confirm(
      `Send a password reset email to ${data.email}?`
    )
    if (!confirmed) return
    setResetBusy(true)
    try {
      await forgotPassword(data.email)
      window.alert(`Password reset email sent to ${data.email}.`)
    } catch {
      window.alert('Failed to send password reset email. Please try again.')
    } finally {
      setResetBusy(false)
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
              boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
            }}
          >
            <h2
              className="mb-4 flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--foreground)',
              }}
            >
              <Building2 size={16} /> Venue Details
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Name:</strong> {data.venueDetails.venueName}
              </p>
              <p>
                <strong>Venue Type:</strong>{' '}
                {data.venueDetails.venueType || 'Not set'}
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={14} style={{ color: 'var(--gold)' }} />
                {data.venueDetails.address}, {data.venueDetails.city},{' '}
                {data.venueDetails.state} {data.venueDetails.zipCode}
              </p>

              <p>
                <strong>Region(s):</strong>{' '}
                {data.regions?.length
                  ? data.regions
                      .map((r: { id: string; name: string }) => r.name)
                      .join(', ')
                  : 'Not set'}
              </p>

              <p>
                <strong>Phone:</strong>{' '}
                {data.venueDetails.phoneNumber || 'Not set'}
              </p>

              <p>
                <strong>Website:</strong>{' '}
                {data.venueDetails.website || 'Not set'}
              </p>

              <p className="mt-3" style={{ color: 'var(--muted-foreground)' }}>
                {data.venueDetails.description}
              </p>
            </div>
          </section>

          {/* LICENSE — compliance-only, never surfaced publicly */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
            }}
          >
            <h2
              className="mb-4 flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--foreground)',
              }}
            >
              <KeyRound size={16} /> Live Music License
            </h2>

            <div className="space-y-2 text-sm">
              <p>
                <strong>License Name:</strong>{' '}
                {data.venueDetails.licenseName || 'Not set'}
              </p>
              <p>
                <strong>License Number:</strong>{' '}
                {data.venueDetails.licenseNumber || 'Not set'}
              </p>
            </div>
          </section>

          {/* SOCIAL LINKS */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
            }}
          >
            <h2
              className="mb-4 flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--foreground)',
              }}
            >
              <Share2 size={16} /> Social Links
            </h2>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Instagram:</strong>{' '}
                {data.venueDetails.socialMedia?.instagram ?? '-'}
              </p>
              <p>
                <strong>TikTok:</strong>{' '}
                {data.venueDetails.socialMedia?.tiktok ?? '-'}
              </p>
              <p>
                <strong>YouTube:</strong>{' '}
                {data.venueDetails.socialMedia?.youtube ?? '-'}
              </p>
              <p>
                <strong>Facebook:</strong>{' '}
                {data.venueDetails.socialMedia?.facebook ?? '-'}
              </p>
              <p>
                <strong>X:</strong> {data.venueDetails.socialMedia?.x ?? '-'}
              </p>
            </div>
          </section>

          {/* CAPACITY + TECH */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
            }}
          >
            <h2
              className="mb-4 flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--foreground)',
              }}
            >
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
                {data.capacitySpecs.stageSize || 'Not set'}
              </p>
              <p>
                <strong>Stage Dimensions:</strong>{' '}
                {data.capacitySpecs.stageDimensions || 'Not set'}
              </p>
              <p>
                <strong>Stage Area Type:</strong>{' '}
                {data.capacitySpecs.stageAreaType || 'Not set'}
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
              boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
            }}
          >
            <h2
              className="mb-4"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--foreground)',
              }}
            >
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
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
              }}
            >
              <h2
                className="mb-4"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--foreground)',
                }}
              >
                Past Performances
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.venueHistory.map((event: VenueHistoryEvent) => (
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
              boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
            }}
          >
            <h2
              className="mb-4 flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--foreground)',
              }}
            >
              <Music2 size={16} /> Booking Preferences
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Event Types:</strong>{' '}
                {data.bookingPreferences.eventTypes.join(', ') || 'None'}
              </p>
              <p>
                <strong>Genres:</strong>{' '}
                {data.bookingPreferences.genresOpenToAll
                  ? 'Open to All'
                  : data.bookingPreferences.genres.join(', ') || 'None'}
              </p>

              <p>
                <strong>Audience Demographics:</strong>{' '}
                {data.bookingPreferences.audienceDemographics?.join(', ') ||
                  'Not set'}
              </p>

              <p>
                <strong>Average Audience Size:</strong>{' '}
                {data.bookingPreferences.averageAudienceSize || 'Not set'}
              </p>

              <p>
                <strong>Pricing Model:</strong>{' '}
                {data.bookingPreferences.pricingModel}
              </p>
              <p>
                <strong>Budget:</strong> {formatBudget(data.bookingPreferences)}
              </p>

              <p>
                <strong>Starting Booking Fee:</strong>{' '}
                {data.bookingPreferences.startingFeeCents != null
                  ? `$${(data.bookingPreferences.startingFeeCents / 100).toFixed(2)}${
                      data.bookingPreferences.startingSetLengthMinutes != null
                        ? ` for ${formatSetLength(data.bookingPreferences.startingSetLengthMinutes)}`
                        : ''
                    }`
                  : 'Not set'}
              </p>

              <p>
                <strong>Maximum Set Length:</strong>{' '}
                {data.bookingPreferences.maxSetLengthMinutes != null
                  ? formatSetLength(data.bookingPreferences.maxSetLengthMinutes)
                  : 'Not set'}
              </p>

              <p>
                <strong>Payment Preferences:</strong>{' '}
                {data.bookingPreferences.paymentPreferences?.length
                  ? data.bookingPreferences.paymentPreferences.join(', ')
                  : 'Not set'}
              </p>

              <p>
                <strong>Booking Lead Time:</strong>{' '}
                {data.bookingPreferences.bookingLeadTime || 'Not set'}
              </p>

              <p>
                <strong>Days for Live Music:</strong>{' '}
                {data.preferredDays?.join(', ') || 'Not set'}
              </p>

              <p style={{ color: 'var(--muted-foreground)' }}>
                {data.bookingPreferences.bookingNotes}
              </p>
            </div>
          </section>

          <RegionSuggestionsPanel
            suggestions={data.regionSuggestions}
            onResolved={refreshVenue}
          />
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
              boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
            }}
          >
            <h2 className="mb-3 text-base font-semibold">Approval Decision</h2>

            {(data.deletedAt || data.accountStatus === 'DEACTIVATED') && (
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium mb-4"
                style={
                  data.deletedAt
                    ? {
                        backgroundColor: 'var(--status-deleted-bg)',
                        color: 'var(--status-deleted-text)',
                      }
                    : {
                        backgroundColor: 'var(--status-deactivated-bg)',
                        color: 'var(--status-deactivated-text)',
                      }
                }
              >
                Account {data.deletedAt ? 'deleted' : 'deactivated'}
              </span>
            )}

            {actionError && (
              <div className="mb-4 text-sm text-red-400">{actionError}</div>
            )}

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">
                Feedback message
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Required to decline — this message will be emailed to the venue explaining why."
                rows={4}
                className="w-full rounded-xl border p-3 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--muted)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              />
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

            <Button
              className="w-full mt-3"
              variant="outline"
              disabled={resetBusy || !data.email}
              onClick={handleResetPassword}
              style={{
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            >
              <KeyRound size={14} />
              {resetBusy ? 'Sending...' : 'Reset Password'}
            </Button>
          </section>
        </div>
      </div>

      {/* PHOTOS */}
      <section
        className="p-6 rounded-3xl border"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <h2
          className="mb-4 flex items-center gap-2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: 600,
            color: 'var(--foreground)',
          }}
        >
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

        {data.photos?.videos?.length > 0 && (
          <>
            <h3
              className="mt-6 mb-3 text-sm font-semibold"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Gallery Videos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.photos.videos.map((vid: string, i: number) => (
                <video
                  key={i}
                  src={resolveImg(vid)}
                  controls
                  className="rounded-xl aspect-square w-full object-cover"
                  style={{ backgroundColor: 'var(--muted)' }}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
