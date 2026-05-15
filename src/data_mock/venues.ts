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
        { url: "/venues/glass1.jpg" },
        { url: "/venues/glass2.jpg" },
        { url: "/venues/glass3.jpg" },
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