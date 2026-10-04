import { useCallback, useMemo, useState } from 'react'

import { DEFAULT_POSITION_SORT, sortPositions, type PositionSort } from '../aggregate'
import { useHistory, useSummary } from '../data'
import { DEFAULT_RANGE, type Change, type Currency, type History, type Range } from '../types'
import { DashboardEmpty, DashboardError, DashboardSkeleton } from './dashboard-states'
import { DashboardHeader } from './dashboard-header'
import { HeroTotal } from './hero-total'
import { KpiTiles } from './kpi-tiles'
import { PositionsSection } from './positions-section'
import { SourcesDonut } from './sources-donut'
import { ValueChart } from './value-chart'

/**
 * Jedyny komponent widoku, który sięga po dane. Wszystko poniżej dostaje je
 * przez propsy, żeby podmiana `data.ts` na prawdziwe API nic tu nie zmieniła.
 */
export function PortfolioDashboard() {
  const [currency, setCurrency] = useState<Currency>('USD')
  const [range, setRange] = useState<Range>(DEFAULT_RANGE)
  const [sort, setSort] = useState<PositionSort>(DEFAULT_POSITION_SORT)

  const summary = useSummary(currency)
  const history = useHistory(range, currency)

  const retry = useCallback(() => {
    summary.refetch()
    history.refetch()
  }, [summary, history])

  const positions = useMemo(
    () => (summary.data ? sortPositions(summary.data.positions, sort) : []),
    [summary.data, sort],
  )

  const heroChange = useMemo(
    () => resolveHeroChange(range, summary.data?.change, history.data),
    [range, summary.data?.change, history.data],
  )

  const isPending = summary.isPending || history.isPending
  const isError = summary.isError || history.isError
  const isEmpty = Boolean(summary.data && summary.data.sources.length === 0)

  return (
    <div className="min-h-svh bg-background text-foreground">
      <DashboardHeader
        takenAt={summary.data?.takenAt ?? null}
        complete={summary.data?.complete ?? true}
        currency={currency}
        onCurrencyChange={setCurrency}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8">
        {isError ? (
          <DashboardError onRetry={retry} />
        ) : isPending || !summary.data || !history.data ? (
          <DashboardSkeleton />
        ) : isEmpty ? (
          <DashboardEmpty />
        ) : (
          <div className="space-y-6">
            <HeroTotal
              total={summary.data.total}
              currency={currency}
              change={heroChange}
              range={range}
            />

            <KpiTiles
              change={summary.data.change}
              ath={summary.data.ath}
              total={summary.data.total}
              currency={currency}
            />

            <div className="grid min-w-0 gap-4 xl:grid-cols-3">
              <div className="min-w-0 xl:col-span-2">
                <ValueChart
                  history={history.data}
                  currency={currency}
                  range={range}
                  onRangeChange={setRange}
                />
              </div>
              <SourcesDonut
                sources={summary.data.sources}
                total={summary.data.total}
                currency={currency}
              />
            </div>

            <PositionsSection
              positions={positions}
              currency={currency}
              sort={sort}
              onSortChange={setSort}
            />
          </div>
        )}
      </main>
    </div>
  )
}

/**
 * Hero pokazuje zmianę dla zakresu wybranego na wykresie. Dla 24H/7D/30D
 * bierzemy ją z podsumowania, dla dłuższych zakresów liczymy z końców
 * historii — backend nie zwraca dla nich gotowych pól.
 */
function resolveHeroChange(
  range: Range,
  change: { h24: Change | null; d7: Change | null; d30: Change | null } | undefined,
  history: History | undefined,
): Change | null {
  if (range === '24H') return change?.h24 ?? null
  if (range === '7D') return change?.d7 ?? null
  if (range === '30D') return change?.d30 ?? null

  const first = history?.points[0]
  const last = history?.points.at(-1)
  if (!first || !last) return null

  const abs = last.value - first.value
  return { abs, pct: first.value === 0 ? 0 : abs / first.value }
}
