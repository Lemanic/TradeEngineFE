import { TriangleAlert } from 'lucide-react'

import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { formatDateTime, formatRelative, formatTime } from '../format'
import type { Currency } from '../types'
import { CurrencySwitcher } from './currency-switcher'
import { PrivacyToggle } from './privacy-toggle'

type DashboardHeaderProps = {
  takenAt: string | null
  complete: boolean
  currency: Currency
  onCurrencyChange: (currency: Currency) => void
}

export function DashboardHeader({
  takenAt,
  complete,
  currency,
  onCurrencyChange,
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Portfel</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {takenAt ? (
              <>
                <span>
                  aktualizacja <time dateTime={takenAt}>{formatTime(takenAt)}</time>
                </span>
                <span aria-hidden="true">·</span>
                <span title={formatDateTime(takenAt)}>{formatRelative(takenAt)}</span>
              </>
            ) : (
              <span>brak snapshotu</span>
            )}
            {!complete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    <TriangleAlert aria-hidden="true" className="size-3" />
                    dane niepełne
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  Snapshot nie objął wszystkich źródeł — część wartości może być nieaktualna.
                </TooltipContent>
              </Tooltip>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <CurrencySwitcher value={currency} onChange={onCurrencyChange} />
          <PrivacyToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
