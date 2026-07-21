/**
 * Formats a date-only value (e.g. "2026-07-14", with no time/offset) as a
 * calendar date in the viewer's locale, without ever routing through UTC.
 *
 * `new Date("2026-07-14")` is parsed as UTC midnight by the JS spec, so
 * formatting it with `toLocaleDateString` can print the previous day for
 * anyone west of UTC. Building the Date from local y/m/d components avoids
 * that shift entirely.
 */
export function formatDateOnly(
  value: string,
  options?: Intl.DateTimeFormatOptions,
  locale?: string
): string {
  const [datePart] = value.split('T')
  const [year, month, day] = datePart.split('-').map(Number)

  if (!year || !month || !day) return value

  return new Date(year, month - 1, day).toLocaleDateString(locale, options)
}

/**
 * Formats a full ISO datetime (with time/offset) in the viewer's local
 * timezone. Returns "-" for missing/invalid input.
 */
export function formatDateTime(
  date?: string | null,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  },
  locale = 'en-AU'
): string {
  if (!date) return '-'

  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) return '-'

  return new Intl.DateTimeFormat(locale, options).format(parsed)
}
