/**
 * The backend has no dedicated "profile-level streaming links" concept — only
 * releases with per-platform links. By convention, a release titled exactly
 * STREAMING_LINKS_RELEASE_TITLE holds the artist's general streaming-platform
 * links and should be displayed separately from actual music releases.
 * Mirrors tap-fe's src/lib/artist/streamingLinks.ts.
 */
export const STREAMING_LINKS_RELEASE_TITLE = 'Streaming Links'

export function isStreamingLinksRelease(title: string): boolean {
  return (
    title.trim().toLowerCase() === STREAMING_LINKS_RELEASE_TITLE.toLowerCase()
  )
}

export interface ReleaseLike {
  id: string
  title: string
  releaseType: string
  releaseDate: string | null
  links: { platform: string; url: string }[]
}

/** Splits a release list into the sentinel "Streaming Links" release (if any) and real releases. */
export function splitReleases<T extends ReleaseLike>(
  releases: T[]
): { streamingLinksRelease: T | undefined; releases: T[] } {
  const streamingLinksRelease = releases.find((r) =>
    isStreamingLinksRelease(r.title)
  )
  const rest = releases.filter((r) => !isStreamingLinksRelease(r.title))
  return { streamingLinksRelease, releases: rest }
}

export const STREAMING_PLATFORMS: { enum: string; label: string }[] = [
  { enum: 'SPOTIFY', label: 'Spotify' },
  { enum: 'APPLE_MUSIC', label: 'Apple Music' },
  { enum: 'SOUNDCLOUD', label: 'SoundCloud' },
  { enum: 'BANDCAMP', label: 'Bandcamp' },
  { enum: 'YOUTUBE_MUSIC', label: 'YouTube Music' },
]

export function platformLabel(enumValue: string): string {
  return (
    STREAMING_PLATFORMS.find((p) => p.enum === enumValue.toUpperCase())
      ?.label ?? enumValue
  )
}
