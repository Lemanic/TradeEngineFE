import { useCallback, useMemo, useState } from 'react'

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
 * Kształt wyniku jest celowo taki jak w TanStack Query, żeby podłączenie
 * backendu sprowadzało się do podmiany wnętrza tych dwóch hooków na
 * `useQuery` — bez dotykania komponentów.
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

function currentPreviewState(): PreviewState | null {
  if (typeof window === 'undefined') return null
  return readPreviewState(window.location.search)
}

/**
 * Licznik wymuszający przeliczenie. `refetch` z danymi testowymi nie ma czego
 * dociągać, ale musi istnieć i działać, bo przycisk „Spróbuj ponownie” jest
 * częścią widoku. Przy `?state=error` ponowienie nadal zwraca błąd — stan
 * jest wymuszony URL-em, nie losowy.
 */
function useRefetchCounter() {
  const [counter, setCounter] = useState(0)
  const refetch = useCallback(() => setCounter((value) => value + 1), [])
  return { counter, refetch }
}

export function useSummary(currency: Currency): QueryResult<Summary> {
  const { counter, refetch } = useRefetchCounter()

  const data = useMemo(() => {
    void counter
    const preview = currentPreviewState()

    if (preview === 'loading' || preview === 'error') return undefined
    if (preview === 'empty') return emptySummaryFixture(currency)
    return summaryFixture(currency, { incomplete: preview === 'incomplete' })
  }, [currency, counter])

  const preview = currentPreviewState()

  return {
    data,
    isPending: preview === 'loading',
    isError: preview === 'error',
    refetch,
  }
}

export function useHistory(range: Range, currency: Currency): QueryResult<History> {
  const { counter, refetch } = useRefetchCounter()

  const data = useMemo(() => {
    void counter
    const preview = currentPreviewState()

    if (preview === 'loading' || preview === 'error') return undefined
    if (preview === 'empty') return emptyHistoryFixture(range, currency)
    return historyFixture(range, currency, { incomplete: preview === 'incomplete' })
  }, [range, currency, counter])

  const preview = currentPreviewState()

  return {
    data,
    isPending: preview === 'loading',
    isError: preview === 'error',
    refetch,
  }
}
