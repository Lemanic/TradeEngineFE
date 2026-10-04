import type {
  Change,
  Currency,
  History,
  HistoryPoint,
  Interval,
  Position,
  Range,
  Source,
  Summary,
} from './types'

/**
 * Dane testowe w kształcie przyszłych odpowiedzi API.
 *
 * To jedyny plik z wymyślonymi liczbami. Po podłączeniu backendu nie trzeba go
 * usuwać — wystarczy przestać go importować w `data.ts` (zostaje jako źródło
 * danych dla `?state=` i dla testów).
 */

/** Kurs USD→PLN. Docelowo przyjdzie z backendu razem z podsumowaniem. */
const PLN_RATE = 3.7

const HOUR_MS = 3_600_000
const DAY_MS = 24 * HOUR_MS

type BasePosition = {
  source: string
  network: string
  asset: string
  amount: number
  /** Cena w USD. */
  price: number
  stale?: boolean
}

const BASE_POSITIONS: readonly BasePosition[] = [
  { source: 'Rabby', network: 'ethereum', asset: 'ETH', amount: 2.41, price: 3735 },
  { source: 'Rabby', network: 'arbitrum', asset: 'ETH', amount: 2.0875, price: 3735 },
  { source: 'Rabby', network: 'arbitrum', asset: 'USDC', amount: 3400.42, price: 1 },
  { source: 'Trezor', network: 'bitcoin-cash', asset: 'BCH', amount: 21.5, price: 511.63 },
  { source: 'Trezor', network: 'bsc', asset: 'BNB', amount: 7.15, price: 601.4 },
  { source: 'TAO staking', network: 'bittensor', asset: 'TAO', amount: 27.78, price: 360 },
  { source: 'TRB staking', network: 'ethereum', asset: 'TRB', amount: 48.25, price: 49.75 },
]

function rate(currency: Currency): number {
  return currency === 'PLN' ? PLN_RATE : 1
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/** Snapshoty powstają o pełnych godzinach, więc czas ucinamy do godziny. */
export function snapshotTime(now: Date = new Date()): Date {
  const takenAt = new Date(now)
  takenAt.setMinutes(0, 0, 0)
  return takenAt
}

function buildPositions(currency: Currency, staleAsset: string | null): Position[] {
  const multiplier = rate(currency)

  const valued = BASE_POSITIONS.map((position) => ({
    ...position,
    price: round2(position.price * multiplier),
    value: round2(position.amount * position.price * multiplier),
  }))

  const total = valued.reduce((sum, position) => sum + position.value, 0)

  return valued.map((position) => ({
    source: position.source,
    network: position.network,
    asset: position.asset,
    amount: position.amount,
    price: position.price,
    value: position.value,
    pct: position.value / total,
    stale: staleAsset !== null && position.asset === staleAsset,
  }))
}

function buildSources(positions: readonly Position[], total: number): Source[] {
  const byName = new Map<string, number>()

  for (const position of positions) {
    byName.set(position.source, (byName.get(position.source) ?? 0) + position.value)
  }

  return [...byName.entries()]
    .map(([name, value]) => ({ name, value: round2(value), pct: value / total }))
    .sort((a, b) => b.value - a.value)
}

/**
 * Zmiana liczona z bazowej serii, nie wpisana z palca — inaczej hero
 * pokazywałby inną deltę niż ta widoczna na wykresie.
 */
function buildChange(totalUsd: number, hoursBack: number, multiplier: number): Change {
  const before = valueHoursBack(totalUsd, hoursBack)
  const abs = (totalUsd - before) * multiplier
  return { abs: round2(abs), pct: before === 0 ? 0 : (totalUsd - before) / before }
}

// --- historia -------------------------------------------------------------

/** Deterministyczny PRNG (mulberry32) — ten sam wykres przy każdym uruchomieniu. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SEED = 20_260_401

/** Długość bazowej serii: ~18 miesięcy co godzinę. */
const BASE_HOURS = 540 * 24

/**
 * Trend: mnożnik wartości `total` dla danej liczby godzin wstecz.
 * Punkty zaczepienia dają konkretną historię — wzrost przez rok, szczyt
 * ok. 150 dni temu, korekta, odbicie w ostatnim miesiącu i lekki spadek
 * w ostatnim tygodniu. Interpolacja jest liniowa w logarytmie.
 */
const TREND_ANCHORS: readonly { hoursBack: number; multiplier: number }[] = [
  { hoursBack: 0, multiplier: 1 },
  { hoursBack: 24, multiplier: 0.9935 },
  { hoursBack: 168, multiplier: 1.017 },
  { hoursBack: 720, multiplier: 0.974 },
  { hoursBack: 2160, multiplier: 0.9 },
  { hoursBack: 2880, multiplier: 0.95 },
  { hoursBack: 3600, multiplier: 1.096 },
  { hoursBack: 5760, multiplier: 0.88 },
  { hoursBack: 8760, multiplier: 0.77 },
  { hoursBack: BASE_HOURS - 1, multiplier: 0.55 },
]

function trendMultiplier(hoursBack: number): number {
  const first = TREND_ANCHORS[0]
  const last = TREND_ANCHORS[TREND_ANCHORS.length - 1]
  if (!first || !last) return 1
  if (hoursBack <= first.hoursBack) return first.multiplier
  if (hoursBack >= last.hoursBack) return last.multiplier

  for (let i = 1; i < TREND_ANCHORS.length; i += 1) {
    const to = TREND_ANCHORS[i]
    const from = TREND_ANCHORS[i - 1]
    if (!to || !from || hoursBack > to.hoursBack) continue

    const span = to.hoursBack - from.hoursBack
    const weight = span === 0 ? 0 : (hoursBack - from.hoursBack) / span
    return Math.exp(Math.log(from.multiplier) * (1 - weight) + Math.log(to.multiplier) * weight)
  }

  return last.multiplier
}

/**
 * Szum AR(1) w logarytmie — stacjonarny, więc nie znosi trendu
 * (zwykły losowy spacer rozjechałby punkty zaczepienia).
 */
const NOISE_PERSISTENCE = 0.995
const NOISE_SHOCK = 0.0015

/**
 * Jedna bazowa seria godzinowa w USD, z której wszystkie zakresy są próbkowane.
 * Dzięki temu krzywa 24H jest końcówką krzywej 1Y, a nie osobnym losowaniem.
 * Idziemy od teraźniejszości w przeszłość, a w punkcie zerowym trend i szum
 * są dokładnie neutralne — ostatni punkt to zawsze dokładnie `total`.
 */
function buildBaseSeries(total: number): number[] {
  const random = mulberry32(SEED)
  const values = new Array<number>(BASE_HOURS)
  let noise = 0

  for (let hoursBack = 0; hoursBack < BASE_HOURS; hoursBack += 1) {
    const index = BASE_HOURS - 1 - hoursBack
    values[index] = Math.max(1, total * trendMultiplier(hoursBack) * Math.exp(noise))
    noise = NOISE_PERSISTENCE * noise + NOISE_SHOCK * (random() * 2 - 1)
  }

  return values
}

let baseSeriesCache: { total: number; values: number[] } | null = null

function baseSeries(total: number): number[] {
  if (baseSeriesCache?.total !== total) {
    baseSeriesCache = { total, values: buildBaseSeries(total) }
  }
  return baseSeriesCache.values
}

/** Wartość sprzed `hoursBack` godzin — podstawa zmian 24 h / 7 d / 30 d. */
function valueHoursBack(total: number, hoursBack: number): number {
  const series = baseSeries(total)
  const index = Math.max(0, series.length - 1 - hoursBack)
  return series[index] ?? total
}

type RangeConfig = {
  interval: Interval
  /** Co ile godzin bazowej serii bierzemy punkt. */
  everyHours: number
  points: number
}

const RANGE_CONFIG: Record<Range, RangeConfig> = {
  '24H': { interval: '1h', everyHours: 1, points: 24 },
  '7D': { interval: '1h', everyHours: 1, points: 7 * 24 },
  '30D': { interval: '4h', everyHours: 4, points: 30 * 6 },
  '90D': { interval: '1d', everyHours: 24, points: 90 },
  '1Y': { interval: '1d', everyHours: 24, points: 365 },
  ALL: { interval: '1d', everyHours: 24, points: 540 },
}

function buildHistoryPoints(
  range: Range,
  takenAt: Date,
  totalUsd: number,
  targetTotal: number,
  lastIncomplete: boolean,
): HistoryPoint[] {
  const { everyHours, points } = RANGE_CONFIG[range]
  const series = baseSeries(totalUsd)
  // Skalujemy wprost do waluty docelowej, a nie kursem — inaczej podwójne
  // zaokrąglenie rozjechałoby ostatni punkt z `total` o grosz.
  const multiplier = totalUsd === 0 ? 1 : targetTotal / totalUsd
  const result: HistoryPoint[] = []

  for (let i = points - 1; i >= 0; i -= 1) {
    const hoursBack = i * everyHours
    const index = series.length - 1 - hoursBack
    const value = series[Math.max(0, index)] ?? totalUsd

    result.push({
      t: new Date(takenAt.getTime() - hoursBack * HOUR_MS).toISOString(),
      value: round2(value * multiplier),
      complete: true,
    })
  }

  const last = result.at(-1)
  if (last) {
    // Ostatni punkt to ta sama liczba, którą pokazuje hero — bez przybliżeń.
    last.value = targetTotal
    if (lastIncomplete) last.complete = false
  }

  return result
}

/** ATH bierzemy z maksimum bazowej serii — inaczej spadek od ATH kłamałby. */
function buildAth(currency: Currency, takenAt: Date, totalUsd: number) {
  const series = baseSeries(totalUsd)

  let bestIndex = 0
  let bestValue = series[0] ?? totalUsd

  for (let i = 1; i < series.length; i += 1) {
    const value = series[i] ?? 0
    if (value > bestValue) {
      bestValue = value
      bestIndex = i
    }
  }

  const hoursBack = series.length - 1 - bestIndex

  return {
    value: round2(bestValue * rate(currency)),
    at: new Date(takenAt.getTime() - hoursBack * HOUR_MS).toISOString(),
  }
}

// --- API fixtures ---------------------------------------------------------

export type FixtureOptions = {
  now?: Date
  /** Snapshot nie objął wszystkich źródeł. */
  incomplete?: boolean
}

export function summaryFixture(currency: Currency, options: FixtureOptions = {}): Summary {
  const takenAt = snapshotTime(options.now)
  const incomplete = options.incomplete ?? false

  const positions = buildPositions(currency, incomplete ? 'TRB' : null)
  const total = round2(positions.reduce((sum, position) => sum + position.value, 0))
  const totalUsd = currency === 'PLN' ? round2(total / PLN_RATE) : total
  const multiplier = rate(currency)

  return {
    takenAt: takenAt.toISOString(),
    currency,
    total,
    complete: !incomplete,
    change: {
      h24: buildChange(totalUsd, 24, multiplier),
      d7: buildChange(totalUsd, 7 * 24, multiplier),
      d30: buildChange(totalUsd, 30 * 24, multiplier),
    },
    ath: buildAth(currency, takenAt, totalUsd),
    sources: buildSources(positions, total),
    positions,
  }
}

export function historyFixture(
  range: Range,
  currency: Currency,
  options: FixtureOptions = {},
): History {
  const takenAt = snapshotTime(options.now)
  const summary = summaryFixture(currency, options)
  const totalUsd = currency === 'PLN' ? round2(summary.total / PLN_RATE) : summary.total

  return {
    range,
    interval: RANGE_CONFIG[range].interval,
    currency,
    points: buildHistoryPoints(
      range,
      takenAt,
      totalUsd,
      summary.total,
      options.incomplete ?? false,
    ),
  }
}

/** Portfel bez ani jednego snapshotu — stan pusty widoku. */
export function emptySummaryFixture(currency: Currency, options: FixtureOptions = {}): Summary {
  const takenAt = snapshotTime(options.now)

  return {
    takenAt: takenAt.toISOString(),
    currency,
    total: 0,
    complete: true,
    change: { h24: null, d7: null, d30: null },
    ath: { value: 0, at: takenAt.toISOString() },
    sources: [],
    positions: [],
  }
}

export function emptyHistoryFixture(range: Range, currency: Currency): History {
  return { range, interval: RANGE_CONFIG[range].interval, currency, points: [] }
}

export { DAY_MS, HOUR_MS, PLN_RATE }
