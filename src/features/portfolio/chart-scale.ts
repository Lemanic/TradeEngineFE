/**
 * Oś Y ma pokazywać okrągłe liczby (46 tys., 47 tys.), a nie surowe
 * minimum i maksimum serii. Klasyczny algorytm „nice numbers”.
 */
export type Scale = {
  domain: [number, number]
  ticks: number[]
}

function niceStep(rawStep: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const normalized = rawStep / magnitude

  if (normalized <= 1) return magnitude
  if (normalized <= 2) return 2 * magnitude
  if (normalized <= 5) return 5 * magnitude
  return 10 * magnitude
}

export function niceScale(values: readonly number[], tickCount = 5): Scale {
  if (values.length === 0) return { domain: [0, 1], ticks: [0, 1] }

  const min = Math.min(...values)
  const max = Math.max(...values)
  // Płaska seria nie ma rozpiętości — dajemy jej sztuczny margines.
  const span = max - min || Math.abs(max) || 1
  const step = niceStep(span / Math.max(1, tickCount - 1))

  const start = Math.floor(min / step) * step
  const end = Math.ceil(max / step) * step

  const ticks: number[] = []
  for (let value = start; value <= end + step / 2; value += step) {
    // Krok bywa ułamkowy, więc kasujemy błąd zmiennoprzecinkowy.
    ticks.push(Math.round(value * 1e6) / 1e6)
  }

  return { domain: [start, end], ticks }
}

/**
 * Oś procentowa trybu prywatnego. Dane na wykresie zostają kwotowe — tutaj
 * liczymy okrągłe kroki w procentach i mapujemy je z powrotem na wartości
 * (`base * (1 + pct)`). Dzięki temu krzywa, domena i tooltip nie wiedzą o
 * zmianie jednostki, a oś pokazuje „+2%”, a nie procent wynikły z okrągłej
 * kwoty.
 */
export type PercentScale = Scale & {
  /** Wartość odniesienia — zero na osi. */
  base: number
  /** Udział wobec bazy: 0 na linii zera, 0,05 dla +5%. */
  pctOf: (value: number) => number
}

/** Tyle z `HistoryPoint`, ile potrzebuje skala — bez importu typów domenowych. */
type ScalePoint = {
  value: number
  complete: boolean
}

/** Seria bez rozpiętości dostaje pasmo ±1%, inaczej domena byłaby punktem. */
const FLAT_PERCENT_BAND = 0.01

/**
 * Bazą jest pierwszy **pełny** snapshot zakresu: niepełny ma zaniżoną wartość,
 * więc zero osi wypadłoby za nisko i cała krzywa wisiałaby nad linią zera.
 * Gdy pełnego nie ma, bierzemy pierwszy dodatni — przesunięta oś jest wciąż
 * lepsza niż jej brak. Wartość zero bazą być nie może: procent z niej nie istnieje.
 */
function percentBase(points: readonly ScalePoint[]): number | null {
  const complete = points.find((point) => point.complete && point.value > 0)
  if (complete) return complete.value

  const any = points.find((point) => point.value > 0)
  return any ? any.value : null
}

export function percentScale(points: readonly ScalePoint[], tickCount = 5): PercentScale | null {
  const base = percentBase(points)
  if (base === null) return null

  const pctOf = (value: number) => Math.round((value / base - 1) * 1e6) / 1e6

  const percents = points.map((point) => pctOf(point.value))
  const min = Math.min(...percents)
  const max = Math.max(...percents)
  const scale =
    min === max
      ? niceScale([min - FLAT_PERCENT_BAND, max + FLAT_PERCENT_BAND], tickCount)
      : niceScale(percents, tickCount)

  return {
    base,
    domain: [base * (1 + scale.domain[0]), base * (1 + scale.domain[1])],
    ticks: scale.ticks.map((tick) => base * (1 + tick)),
    pctOf,
  }
}
