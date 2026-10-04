import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from 'cn'

import { formatSignedPercent } from '../format'
import type { Change, Currency } from '../types'
import { Amount } from './amount'

type DeltaProps = {
  change: Change | null
  currency: Currency
  /** `lg` dla hero, `sm` dla kafelków i tabeli. */
  size?: 'sm' | 'lg'
  hideAmount?: boolean
  className?: string
}

function direction(change: Change): 'up' | 'down' | 'flat' {
  if (change.abs > 0) return 'up'
  if (change.abs < 0) return 'down'
  return 'flat'
}

const ICONS = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
} as const

const LABELS = {
  up: 'wzrost',
  down: 'spadek',
  flat: 'bez zmiany',
} as const

/**
 * Zysk/strata: zawsze znak i strzałka, kolor tylko je wzmacnia —
 * sam kolor nie może nieść informacji.
 */
export function Delta({
  change,
  currency,
  size = 'sm',
  hideAmount = false,
  className,
}: DeltaProps) {
  if (!change) {
    return <span className={cn('text-muted-foreground', className)}>brak danych</span>
  }

  const trend = direction(change)
  const Icon = ICONS[trend]

  return (
    <span
      className={cn(
        'inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-medium',
        trend === 'up' && 'text-gain',
        trend === 'down' && 'text-loss',
        trend === 'flat' && 'text-muted-foreground',
        size === 'lg' ? 'text-base' : 'text-sm',
        className,
      )}
    >
      <Icon aria-hidden="true" className={size === 'lg' ? 'size-4' : 'size-3.5'} />
      <span className="sr-only">{LABELS[trend]} </span>
      {!hideAmount && <Amount value={change.abs} currency={currency} signed />}
      <span className="num text-muted-foreground">{formatSignedPercent(change.pct)}</span>
    </span>
  )
}
