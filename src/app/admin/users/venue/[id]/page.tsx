'use client'

import NextImage from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Shield,
  RefreshCw,
  MapPin,
  Building2,
  Users,
  Music2,
  Image as ImageIcon,
} from 'lucide-react'
import { ExternalLink } from 'lucide-react'
import { use } from 'react'
import { useAdminVenue } from '@/hooks/queries/useAdminVenues'

export default function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const { data: venue, isLoading, error } = useAdminVenue(id)

  if (isLoading) {
    return <div className="p-6">Loading venue...</div>
  }

  if (error || !venue) {
    return <div className="text-center py-20">Venue not found</div>
  }

  const data = venue

  const API_BASE = (
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'
  ).replace('/api/v1', '')
  const resolveImg = (url: string) =>
    url.startsWith('http') ? url : `${API_BASE}${url}`

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
                      <div className="relative mt-2 rounded-lg aspect-video overflow-hidden">
                        <NextImage
                          src={resolveImg(event.media)}
                          alt={event.performanceName || 'Venue history'}
                          fill
                          className="object-cover"
                        />
                      </div>
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
                Budget: {data.bookingPreferences.minPrice} -{' '}
                {data.bookingPreferences.maxPrice}
              </p>

              <p style={{ color: 'var(--muted-foreground)' }}>
                {data.bookingPreferences.bookingNotes}
              </p>
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="space-y-1">
            <Button
              className="w-full"
              disabled={!data.slug || !data.marketplaceUnlocked}
              onClick={() =>
                window.open(
                  `${process.env.NEXT_PUBLIC_PLATFORM_URL}/venues/${data.slug}`,
                  '_blank'
                )
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
            {!data.marketplaceUnlocked && (
              <p
                className="text-center text-xs"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Venue not yet approved — not publicly visible
              </p>
            )}
          </div>

          {/* ADMIN ACTIONS */}
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
                Suspend Venue
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

          {/* QUICK SUMMARY */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h2 className="mb-4">Quick Summary</h2>

            <div className="text-sm space-y-2">
              <p>Capacity: {data.capacitySpecs.capacity}</p>
              <p>Stage: {data.capacitySpecs.hasStage ? 'Yes' : 'No'}</p>
              <p>City: {data.venueDetails.city}</p>
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
          <ImageIcon size={16} /> Venue Photos
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
