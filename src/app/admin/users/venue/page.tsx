"use client"

import { venues } from "@/data_mock/venues"
import { Button } from "@/components/ui/button"
import {
  Ban,
  Shield,
  RefreshCw,
  MapPin,
  Building2,
  Users,
  Music2,
  Image as ImageIcon,
} from "lucide-react"
import { useAdminVenue } from "@/hooks/queries/useAdminVenues";

import { ExternalLink } from "lucide-react"
export default function VenueDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: venue, isLoading, error } = useAdminVenue(params.id);

  if (isLoading) {
    return <div className="p-6">Loading venue...</div>;
  }

  if (error || !venue) {
    return (
      <div className="text-center py-20">
        Venue not found
      </div>
    );
  }

  const data = venue;

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <p
          className="mb-2"
          style={{
            color: "var(--muted-foreground)",
            fontSize: "11px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Admin • Venue Inspection
        </p>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "54px",
            fontWeight: 500,
            color: "var(--foreground)",
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
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
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
                <MapPin size={14} style={{ color: "var(--gold)" }} />
                {data.venueDetails.address}, {data.venueDetails.city},{" "}
                {data.venueDetails.state} {data.venueDetails.zipCode}
              </p>

              <p className="mt-3" style={{ color: "var(--muted-foreground)" }}>
                {data.venueDetails.description}
              </p>
            </div>
          </section>

          {/* CAPACITY + TECH */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <h2 className="mb-4 flex items-center gap-2">
              <Users size={16} /> Capacity & Stage
            </h2>

            <div className="space-y-2 text-sm">
              <p>
                Capacity:{" "}
                <span style={{ color: "var(--foreground)" }}>
                  {data.capacitySpecs.capacity}
                </span>
              </p>

              <p>
                Stage:{" "}
                {data.capacitySpecs.hasStage ? "Available" : "Not Available"}
              </p>

              <p>Stage Size: {data.capacitySpecs.stageDimensions}</p>

              <p>
                Sound System:{" "}
                {data.capacitySpecs.soundSystem.join(", ") || "None listed"}
              </p>

              <p style={{ color: "var(--muted-foreground)" }}>
                {data.capacitySpecs.soundSystemNotes}
              </p>
            </div>
          </section>

          {/* BOOKING PREFERENCES */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <h2 className="mb-4 flex items-center gap-2">
              <Music2 size={16} /> Booking Preferences
            </h2>

            <div className="space-y-2 text-sm">
              <p>
                Event Types:{" "}
                {data.bookingPreferences.eventTypes.join(", ") || "None"}
              </p>

              <p>
                Genres:{" "}
                {data.bookingPreferences.genres.join(", ") || "All"}
              </p>

              <p>
                Pricing Model: {data.bookingPreferences.pricingModel}
              </p>

              <p>
                Budget: {data.bookingPreferences.minPrice} -{" "}
                {data.bookingPreferences.maxPrice}
              </p>

              <p style={{ color: "var(--muted-foreground)" }}>
                {data.bookingPreferences.bookingNotes}
              </p>
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <Button
            className="w-full"
            onClick={() =>
              window.open(
                "https://civic-sauna-76601524.figma.site/",
                "_blank"
              )
            }
            style={{
              backgroundColor: "var(--muted)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            }}
          >
            <ExternalLink size={14} />
            Show Preview
          </Button>

          {/* ADMIN ACTIONS */}
          <section
            className="p-6 rounded-3xl border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <h2 className="mb-6">Admin Actions</h2>

            <div className="space-y-3">
              <Button
                className="w-full"
                style={{
                  backgroundColor: "var(--status-active-bg)",
                  color: "var(--status-active-text)",
                }}
              >
                <Shield size={14} />
                Suspend Venue
              </Button>

              <Button
                className="w-full"
                style={{
                  backgroundColor: "var(--status-banned-bg)",
                  color: "var(--status-banned-text)",
                }}
              >
                <Ban size={14} />
                Ban Venue
              </Button>

              <Button
                className="w-full"
                variant="outline"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
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
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <h2 className="mb-4">Quick Summary</h2>

            <div className="text-sm space-y-2">
              <p>Capacity: {data.capacitySpecs.capacity}</p>
              <p>Stage: {data.capacitySpecs.hasStage ? "Yes" : "No"}</p>
              <p>City: {data.venueDetails.city}</p>
            </div>
          </section>
        </div>
      </div>

      {/* PHOTOS */}
      <section
        className="p-6 rounded-3xl border"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <h2 className="mb-4 flex items-center gap-2">
          <ImageIcon size={16} /> Venue Photos
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
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              No images uploaded
            </p>
          )}
        </div>
      </section>
    </div>
  )
}