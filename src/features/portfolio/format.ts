import type { Currency, Range } from './types'

/** Maska trybu prywatnego. Zastępuje kwotę, nigdy nie trafia obok niej. */
export const PRIVATE_MASK = '•••••'

const LOCALE = 'pl-PL'

// Formatery są kosztowne w tworzeniu — trzymamy je jako stałe modułu.
const moneyFormatters = new Map<Currency, Intl.NumberFormat>()
const signedMoneyFormatters = new Map<Currency, Intl.NumberFormat>()
const compactFormatters = new Map<Currency, Intl.NumberFormat>()

function moneyFormatter(currency: Currency): Intl.NumberFormat {
  let formatter = moneyFormatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency })
    moneyFormatters.set(currency, formatter)
  }
  return formatter
}

function signedMoneyFormatter(currency: Currency): Intl.NumberFormat {
  let formatter = signedMoneyFormatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency,
      signDisplay: 'always',
    })
    signedMoneyFormatters.set(currency, formatter)
  }
  return formatter
}

function compactFormatter(currency: Currency): Intl.NumberFormat {
  let formatter = compactFormatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    })
    compactFormatters.set(currency, formatter)
  }
  return formatter
}

const percentFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const signedPercentFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'always',
})

const sharePercentFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const amountFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
})

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' })

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const dayFormatter = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' })

const dayLongFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium' })

const monthFormatter = new Intl.DateTimeFormat(LOCALE, { month: 'short' })

const monthYearFormatter = new Intl.DateTimeFormat(LOCALE, { month: 'short', year: 'numeric' })

// style: 'short' daje "12 min temu" / "1 godz. temu" zamiast pełnych form.
const relativeFormatter = new Intl.RelativeTimeFormat(LOCALE, {
  numeric: 'auto',
  style: 'short',
})

export function formatMoney(value: number, currency: Currency): string {
  return moneyFormatter(currency).format(value)
}

/** Kwota zawsze ze znakiem — zysk i strata nigdy nie zależą od samego koloru. */
export function formatSignedMoney(value: number, currency: Currency): string {
  return signedMoneyFormatter(currency).format(value)
}

export function formatCompactMoney(value: number, currency: Currency): string {
  return compactFormatter(currency).format(value)
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value)
}

export function formatSignedPercent(value: number): string {
  return signedPercentFormatter.format(value)
}

/** Udział w portfelu — jedna cyfra po przecinku wystarcza. */
export function formatShare(value: number): string {
  return sharePercentFormatter.format(value)
}

export function formatAmount(value: number): string {
  return amountFormatter.format(value)
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

export function formatRelative(iso: string, now: Date = new Date()): string {
  const diffMs = new Date(iso).getTime() - now.getTime()
  const absMs = Math.abs(diffMs)

  if (absMs < MINUTE_MS) return 'przed chwilą'
  if (absMs < HOUR_MS) return relativeFormatter.format(Math.round(diffMs / MINUTE_MS), 'minute')
  if (absMs < DAY_MS) return relativeFormatter.format(Math.round(diffMs / HOUR_MS), 'hour')
  return relativeFormatter.format(Math.round(diffMs / DAY_MS), 'day')
}

/** Etykieta osi X: godziny dla 24H, dni do 90D, miesiące dla 1Y i ALL. */
export function formatAxisTick(iso: string, range: Range): string {
  const date = new Date(iso)
  switch (range) {
    case '24H':
      return timeFormatter.format(date)
    case '7D':
    case '30D':
    case '90D':
      return dayFormatter.format(date)
    case '1Y':
      return monthFormatter.format(date)
    case 'ALL':
      return monthYearFormatter.format(date)
  }
}

/** Nagłówek tooltipa wykresu — z godziną tylko tam, gdzie punkty są godzinowe. */
export function formatPointLabel(iso: string, range: Range): string {
  const date = new Date(iso)
  if (range === '24H' || range === '7D' || range === '30D') {
    return dateTimeFormatter.format(date)
  }
  return dayLongFormatter.format(date)
}
