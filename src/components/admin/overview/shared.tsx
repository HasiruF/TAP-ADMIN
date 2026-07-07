// src/components/admin/overview/shared.tsx
'use client'

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function ChartHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: LucideIcon
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          backgroundColor: 'rgba(201,168,76,0.08)',
          border: '1px solid rgba(201,168,76,0.12)',
        }}
      >
        <Icon size={18} style={{ color: 'var(--gold)' }} />
      </div>
      <div>
        <p
          style={{
            color: 'var(--muted-foreground)',
            fontSize: '11px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </p>
        <div className="flex items-center gap-1.5">
          <h2
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '22px',
              lineHeight: 1.2,
              fontWeight: 500,
              color: 'var(--foreground)',
            }}
          >
            {title}
          </h2>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={`About ${title}`}
                    className="inline-flex items-center justify-center rounded-full"
                  >
                    <Info
                      size={14}
                      style={{ color: 'var(--muted-foreground)' }}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">{description}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  )
}

function StateBox({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-[320px] flex-col items-center justify-center gap-2 rounded-2xl border"
      style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}
    >
      {children}
    </div>
  )
}

export function ChartLoading() {
  return (
    <StateBox>
      <p style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>
        Loading...
      </p>
    </StateBox>
  )
}

export function ChartError({ message }: { message: string }) {
  return (
    <StateBox>
      <p style={{ color: 'var(--destructive)', fontSize: '13px' }}>{message}</p>
    </StateBox>
  )
}

export function ChartEmpty({ message }: { message: string }) {
  return (
    <StateBox>
      <p style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>
        {message}
      </p>
    </StateBox>
  )
}

// Cycled across bar entries so distribution charts read clearly without
// needing a distinct design-system token per category.
export const CATEGORY_PALETTE = [
  'var(--chart-artists)',
  'var(--chart-venues)',
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]
