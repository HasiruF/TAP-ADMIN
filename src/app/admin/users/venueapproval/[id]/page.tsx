'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Building2,
  Users,
  Music2,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react'
import { use } from 'react'
import { useAdminVenue } from '@/hooks/queries/useAdminVenues'
import { approveVenue, rejectVenue } from '@/lib/api/admin/venues'
import { useRouter } from 'next/navigation'

export default function VenueApprovalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const { data: venue, isLoading, error } = useAdminVenue(id)
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  if (isLoading) return <div className="p-6">Loading venue...</div>
  if (error || !venue)
    return <div className="text-center py-20">Venue not found</div>

  const data = venue

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
    if (!feedback.trim()) {
      setActionError('Please provide feedback before rejecting.')
      return
    }
    setBusy(true)
    setActionError(null)
    try {
      await rejectVenue(id, feedback)
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
            <h2 className="mb-4 flex items-center gap-2">
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
            <h2 className="mb-4 flex items-center gap-2">
              <Users size={16} /> Capacity & Stage
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                Capacity:{' '}
                <span style={{ color: 'var(--foreground)' }}>
                  {data.capacitySpecs.capacity}
                </span>
              </p>
              <p>
                Stage:{' '}
                {data.capacitySpecs.hasStage ? 'Available' : 'Not Available'}
              </p>
              <p>Stage Size: {data.capacitySpecs.stageDimensions}</p>
              <p>
                Sound System:{' '}
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
            <h2 className="mb-4">Equipment & Support</h2>
            <div className="space-y-2 text-sm">
              <p>
                Full Band Support:{' '}
                {data.capacitySpecs.fullBandSupport ? 'Yes' : 'No'}
              </p>
              <p>
                Audio Mixers:{' '}
                {data.capacitySpecs.audioMixersAvailable
                  ? 'Available'
                  : 'Not Available'}
              </p>
              <p>
                Sound Engineer:{' '}
                {data.capacitySpecs.soundEngineerAvailable
                  ? 'Available'
                  : 'Not Available'}
              </p>
              <p>
                Production Team:{' '}
                {data.capacitySpecs.productionTeamAvailable
                  ? 'Available'
                  : 'Not Available'}
              </p>
              <p>
                Equipment Provided:{' '}
                {data.capacitySpecs.equipmentProvided.join(', ') || 'None'}
              </p>
              <p>
                Amenities: {data.capacitySpecs.amenities?.join(', ') || 'None'}
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
              <h2 className="mb-4">Venue History</h2>
              <div className="space-y-4">
                {data.venueHistory.map((event: any) => (
                  <div key={event.id} className="text-sm border p-3 rounded-xl">
                    <p className="font-medium">{event.performanceName}</p>
                    <p className="text-muted-foreground">
                      {event.eventDescription}
                    </p>
                    {event.media && (
                      <img
                        src={event.media}
                        className="mt-2 rounded-lg aspect-video object-cover"
                      />
                    )}
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
            <h2 className="mb-4 flex items-center gap-2">
              <Music2 size={16} /> Booking Preferences
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                Event Types:{' '}
                {data.bookingPreferences.eventTypes.join(', ') || 'None'}
              </p>
              <p>
                Genres: {data.bookingPreferences.genres.join(', ') || 'All'}
              </p>
              <p>Pricing Model: {data.bookingPreferences.pricingModel}</p>
              <p>
                Budget: {data.bookingPreferences.minPrice} –{' '}
                {data.bookingPreferences.maxPrice}
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
          <ImageIcon size={16} /> Venue Photos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.photos?.images?.length > 0 ? (
            data.photos.images.map((img: string, i: number) => (
              <img
                key={i}
                src={img}
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
