/**
 * Kształt przyszłych odpowiedzi API portfela TradeEngine.
 * Dopóki backend nie ma endpointów, te same typy opisują dane testowe
 * z `fixtures.ts` — podmiana wnętrza hooków w `data.ts` nie zmieni widoku.
 */

export type Currency = 'USD' | 'PLN'

export type Range = '24H' | '7D' | '30D' | '90D' | '1Y' | 'ALL'

export type Interval = '1h' | '4h' | '1d'

export const RANGES: readonly Range[] = ['24H', '7D', '30D', '90D', '1Y', 'ALL']

export const CURRENCIES: readonly Currency[] = ['USD', 'PLN']

export const INTERVALS: readonly Interval[] = ['1h', '4h', '1d']

export const DEFAULT_RANGE: Range = '30D'

/** Pełne nazwy zakresów — do etykiet dostępności i podpisu pod hero. */
export const RANGE_LABELS: Record<Range, string> = {
  '24H': '24 godziny',
  '7D': '7 dni',
  '30D': '30 dni',
  '90D': '90 dni',
  '1Y': '1 rok',
  ALL: 'cały okres',
}

/** Zmiana wartości w oknie czasu: kwota i udział. `null`, gdy brak danych historycznych. */
export type Change = {
  abs: number
  pct: number
}

export type Source = {
  name: string
  value: number
  pct: number
}

export type Position = {
  source: string
  network: string
  asset: string
  amount: number
  price: number
  value: number
  pct: number
  stale: boolean
}

export type Summary = {
  /**
   * ISO 8601 — moment wykonania snapshotu. `null`, gdy nie ma ani jednego
   * snapshotu (`204` z `/summary`): nie ma pomiaru, więc nie ma i jego czasu.
   */
  takenAt: string | null
  currency: Currency
  total: number
  /** `false`, gdy snapshot nie objął wszystkich źródeł. */
  complete: boolean
  change: {
    h24: Change | null
    d7: Change | null
    d30: Change | null
  }
  /** Historyczne maksimum. `null`, dopóki backend nie ma historii. */
  ath: {
    value: number
    at: string
  } | null
  sources: Source[]
  positions: Position[]
}

export type HistoryPoint = {
  /** ISO 8601 */
  t: string
  value: number
  complete: boolean
}

export type History = {
  range: Range
  interval: Interval
  currency: Currency
  points: HistoryPoint[]
}
