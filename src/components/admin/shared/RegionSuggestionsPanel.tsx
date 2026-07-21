'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MapPinPlus, Check, X } from 'lucide-react'
import {
  addRegionSuggestion,
  dismissRegionSuggestion,
} from '@/lib/api/admin/venues'
import { getFriendlyErrorMessage } from '@/lib/api/errorMessage'

interface RegionSuggestion {
  id: string
  cityName: string
  suggestedName: string
  dismissed: boolean
  resolved: boolean
}

interface RegionSuggestionsPanelProps {
  suggestions: RegionSuggestion[] | undefined
  onResolved: () => void | Promise<void>
}

/** Shown on both the venue approval page and the ongoing venue detail page —
 * a venue can suggest a missing region at either point in its lifecycle. */
export function RegionSuggestionsPanel({
  suggestions,
  onResolved,
}: RegionSuggestionsPanelProps) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pending = (suggestions ?? []).filter((s) => !s.resolved && !s.dismissed)
  if (pending.length === 0) return null

  async function handleAdd(id: string) {
    setBusyId(id)
    setError(null)
    try {
      await addRegionSuggestion(id)
      await onResolved()
    } catch (e) {
      setError(
        getFriendlyErrorMessage(
          e,
          "Couldn't add this region. Please try again."
        )
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleDismiss(id: string) {
    setBusyId(id)
    setError(null)
    try {
      await dismissRegionSuggestion(id)
      await onResolved()
    } catch (e) {
      setError(
        getFriendlyErrorMessage(
          e,
          "Couldn't dismiss this suggestion. Please try again."
        )
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div
      className="rounded-2xl border p-6"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <MapPinPlus size={16} style={{ color: 'var(--muted-foreground)' }} />
        <h3 className="text-sm font-semibold">Region Suggestions</h3>
      </div>
      <div className="space-y-3">
        {pending.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-3 rounded-xl border p-3"
            style={{ borderColor: 'var(--border)' }}
          >
            <div>
              <p className="text-sm font-medium">{s.suggestedName}</p>
              <p
                className="text-xs"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Suggested region in {s.cityName}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                disabled={busyId === s.id}
                onClick={() => handleDismiss(s.id)}
              >
                <X size={14} className="mr-1" />
                Dismiss
              </Button>
              <Button
                size="sm"
                disabled={busyId === s.id}
                onClick={() => handleAdd(s.id)}
              >
                <Check size={14} className="mr-1" />
                Add as region
              </Button>
            </div>
          </div>
        ))}
      </div>
      {error && (
        <p
          className="mt-3 text-sm"
          style={{ color: 'var(--status-banned-text)' }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
