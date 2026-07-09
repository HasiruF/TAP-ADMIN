interface BackendErrorShape {
  message?: unknown
  statusCode?: unknown
  status?: unknown
  error?: unknown
}

function looksTechnical(message: string): boolean {
  if (!message) return true

  const trimmed = message.trim()

  if (!trimmed) return true
  if (/^HTTP \d/i.test(trimmed)) return true
  if (/internal server error/i.test(trimmed)) return true
  if (trimmed.includes('_')) return true
  if (trimmed.startsWith('<')) return true
  if (/\bat\s+.+\(.+:\d+:\d+\)/.test(trimmed)) return true
  if (trimmed.toLowerCase() === 'undefined' || trimmed.toLowerCase() === 'null')
    return true

  return false
}

function getStatusCode(error: BackendErrorShape): number | undefined {
  const raw = error.statusCode ?? error.status

  return typeof raw === 'number' ? raw : undefined
}

export function getFriendlyErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (!error || typeof error !== 'object') {
    return fallback
  }

  const isErrorInstance = error instanceof Error
  const shape = error as BackendErrorShape

  const hasMessage = typeof shape.message === 'string'
  const hasStatusCode =
    shape.statusCode !== undefined || shape.status !== undefined

  if (!isErrorInstance && !hasMessage && !hasStatusCode) {
    return fallback
  }

  const status = getStatusCode(shape)

  if (status !== undefined) {
    if (status >= 500) return fallback
    if (status === 401) return 'Your session has expired. Please log in again.'
    if (status === 403) return "You don't have permission to do that."
    if (status === 404) return fallback
    if (status === 400 || status === 422) return fallback
  } else {
    return fallback
  }

  if (hasMessage) {
    const message = shape.message as string

    if (!looksTechnical(message)) {
      return message
    }
  }

  return fallback
}
