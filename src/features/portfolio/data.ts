import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { fetchHistory, fetchSummary } from '@/api/portfolio'

import {
  emptyHistoryFixture,
  emptySummaryFixture,
  historyFixture,
  summaryFixture,
} from './fixtures'
import type { Currency, History, Range, Summary } from './types'

/**
 * Jedyne miejsce, z którego widok bierze dane.
 *
 * Kształt wyniku jest węższy niż `UseQueryResult` celowo: komponenty mają
 * widzieć tylko te cztery pola, żeby dane testowe i odpowiedź z API dawały
 * się podstawić jedno za drugie bez dotykania widoku.
 */
export type QueryResult<T> = {
  data: T | undefined
  isPending: boolean
  isError: boolean
  refetch: () => void
}

/** Podgląd stanów widoku przez URL: `?state=loading|empty|error|incomplete`. */
export type PreviewState = 'loading' | 'empty' | 'error' | 'incomplete'

const PREVIEW_STATES: readonly PreviewState[] = ['loading', 'empty', 'error', 'incomplete']

export function readPreviewState(search: string): PreviewState | null {
  const value = new URLSearchParams(search).get('state')
  return PREVIEW_STATES.find((state) => state === value) ?? null
}

/**
 * Dane testowe mają dokładnie dwa wejścia: `?state=` w URL-u i `VITE_MOCK=1`
 * (`npm run dev:mock`, a także testy widoku). **Nigdy** nie są fallbackiem po
 * błędzie API — ciche podstawienie fikcyjnych liczb jest gorsze niż komunikat
 * o awarii, bo użytkownik podejmuje na nich decyzje finansowe.
 *
 * `full` to po prostu normalny dashboard na danych testowych.
 */
type DemoMode = PreviewState | 'full'

function currentDemoMode(): DemoMode | null {
  if (typeof window !== 'undefined') {
    const preview = readPreviewState(window.location.search)
    if (preview) return preview
  }
  return import.meta.env.VITE_MOCK === '1' ? 'full' : null
}

function demoSummary(mode: DemoMode, currency: Currency): Summary | undefined {
  if (mode === 'loading' || mode === 'error') return undefined
  if (mode === 'empty') return emptySummaryFixture(currency)
  return summaryFixture(currency, { incomplete: mode === 'incomplete' })
}

function demoHistory(mode: DemoMode, range: Range, currency: Currency): History | undefined {
  if (mode === 'loading' || mode === 'error') return undefined
  if (mode === 'empty') return emptyHistoryFixture(range, currency)
  return historyFixture(range, currency, { incomplete: mode === 'incomplete' })
}

export function useSummary(currency: Currency): QueryResult<Summary> {
  const demo = currentDemoMode()

  const query = useQuery({
    queryKey: ['portfolio', 'summary', currency],
    queryFn: ({ signal }) => fetchSummary(currency, signal),
    enabled: demo === null,
  })

  const { refetch: refetchQuery } = query
  const refetch = useCallback(() => void refetchQuery(), [refetchQuery])

  // Generator danych testowych buduje całą serię godzinową, więc nie wołamy
  // go, dopóki tryb demo nie jest włączony.
  const demoData = useMemo(
    () => (demo === null ? undefined : demoSummary(demo, currency)),
    [demo, currency],
  )

  if (demo !== null) {
    return { data: demoData, isPending: demo === 'loading', isError: demo === 'error', refetch }
  }

  return { data: query.data, isPending: query.isPending, isError: query.isError, refetch }
}

export function useHistory(range: Range, currency: Currency): QueryResult<History> {
  const demo = currentDemoMode()

  const query = useQuery({
    queryKey: ['portfolio', 'history', range, currency],
    queryFn: ({ signal }) => fetchHistory(range, currency, signal),
    enabled: demo === null,
  })

  const { refetch: refetchQuery } = query
  const refetch = useCallback(() => void refetchQuery(), [refetchQuery])

  const demoData = useMemo(
    () => (demo === null ? undefined : demoHistory(demo, range, currency)),
    [demo, range, currency],
  )

  if (demo !== null) {
    return { data: demoData, isPending: demo === 'loading', isError: demo === 'error', refetch }
  }

  return { data: query.data, isPending: query.isPending, isError: query.isError, refetch }
}
