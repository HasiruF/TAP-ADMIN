export const venues = [
  {
    id: "venue",
    venueDetails: {
      venueName: "The Glass Warehouse",
      address: "42 Marine Drive",
      city: "Colombo",
      state: "Western Province",
      zipCode: "00300",
      description:
        "A modern industrial-style live venue known for indie shows, electronic nights, and acoustic sessions.",
    },
    capacitySpecs: {
      capacity: 350,
      hasStage: true,
      stageDimensions: "8m x 5m",
      soundSystem: ["Yamaha PA System", "Shure Wireless Mics", "Allen & Heath Mixer"],
      soundSystemNotes:
        "Fully professional setup suitable for live bands and DJ performances.",
      amenities: ["Bar", "Parking", "Lighting Rig", "Green Room"],
    },
    photos: {
      images: [
        
        { url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4" },
        { url: "https://images.unsplash.com/photo-1504600770771-fb03a6961d33" },

      ],
    },
    bookingPreferences: {
      eventTypes: ["Live Concerts", "DJ Nights", "Private Events"],
      genres: ["Electronic", "Rock", "Indie", "Jazz"],
      pricingModel: "fixed",
      minPrice: "500",
      maxPrice: "2000",
      bookingNotes:
        "Prefers curated lineups and avoids back-to-back heavy metal events.",
    },
  }
]