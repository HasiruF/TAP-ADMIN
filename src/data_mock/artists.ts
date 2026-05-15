export const artists = [{
  id: "artist",
  basicInfo: {
    stageName: "Luna Reverie",
    profilePicture: "",
    shortBio: "Dream-pop artist blending cinematic soundscapes.",
    extendedBio:
      "Luna Reverie creates immersive dream-pop performances blending ambient textures with emotional storytelling.",
    location: {
      city: "Colombo",
      regions: ["Western", "Southern"],
    },
    artistType: "solo",
    openToTravel: true,
    travelRadius: "200km",
  },
  genres: {
    genres: ["Dream Pop", "Ambient", "Indie"],
    performanceType: "originals",
    performanceStyle: "acoustic",
    actType: "vocal",
    energyLevel: "chill",
  },
  media: {
    images: [],
    videoUrl: "https://youtube.com",
    socialMedia: {
      instagram: "@luna",
      tiktok: "",
      youtube: "",
      facebook: "",
      x: "",
    },
  },
  musicLinks: {
    links: [
      {
        id: "1",
        platform: "Spotify",
        url: "#",
      },
    ],
  },
  bookingInfo: {
    availability: ["Weekends", "Evenings"],
    feeRange: {
      min: "500",
      max: "1500",
      currency: "USD",
    },
    setLengths: ["30 min", "60 min"],
  },
  liveSetup: {
    setupType: "solo",
    equipment: ["Mic", "Guitar"],
    technicalNotes: "Needs reverb support",
  },
}]