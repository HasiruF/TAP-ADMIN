/**
 * Backend enum is COVERS | ORIGINALS | BOTH | TRIBUTE_ACT. "Both" must never render
 * as the literal word "Both" — it always means the artist performs both, so show
 * both labels separately instead of the combined value.
 */
export function formatPerformanceType(
  value: string | null | undefined
): string {
  if (!value) return ''

  switch (value.trim().toUpperCase()) {
    case 'BOTH':
      return 'Originals, Covers'
    case 'ORIGINALS':
      return 'Originals'
    case 'COVERS':
      return 'Covers'
    case 'TRIBUTE_ACT':
      return 'Tribute Act'
    default:
      return value
  }
}
