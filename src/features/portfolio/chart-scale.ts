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
