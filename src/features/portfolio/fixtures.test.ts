import { describe, expect, it } from 'vitest'

import { historyFixture, PLN_RATE, snapshotTime, summaryFixture } from './fixtures'
import { RANGES, type Range } from './types'

const NOW = new Date(2026, 9, 4, 9, 12)

const EXPECTED_POINTS: Record<Range, number> = {
  '24H': 24,
  '7D': 168,
  '30D': 180,
  '90D': 90,
  '1Y': 365,
  ALL: 540,
}

const EXPECTED_INTERVAL: Record<Range, string> = {
  '24H': '1h',
  '7D': '1h',
  '30D': '4h',
  '90D': '1d',
  '1Y': '1d',
  ALL: '1d',
}

describe('historia', () => {
  it.each(RANGES)('zakres %s kończy się dokładnie na bieżącym total', (range) => {
    const summary = summaryFixture('USD', { now: NOW })
    const history = historyFixture(range, 'USD', { now: NOW })

    expect(history.points.at(-1)?.value).toBe(summary.total)
    expect(history.points.at(-1)?.t).toBe(summary.takenAt)
  })

  it.each(RANGES)('zakres %s ma właściwą rozdzielczość', (range) => {
    const history = historyFixture(range, 'USD', { now: NOW })

    expect(history.points).toHaveLength(EXPECTED_POINTS[range])
    expect(history.interval).toBe(EXPECTED_INTERVAL[range])
    expect(history.range).toBe(range)
  })

  it('kończy się na total także w PLN', () => {
    const summary = summaryFixture('PLN', { now: NOW })
    const history = historyFixture('90D', 'PLN', { now: NOW })

    expect(history.points.at(-1)?.value).toBe(summary.total)
    expect(history.currency).toBe('PLN')
  })

  it('jest deterministyczna', () => {
    const first = historyFixture('30D', 'USD', { now: NOW }).points.map((point) => point.value)
    const second = historyFixture('30D', 'USD', { now: NOW }).points.map((point) => point.value)

    expect(first).toEqual(second)
  })

  it('punkty idą chronologicznie', () => {
    const points = historyFixture('7D', 'USD', { now: NOW }).points
    const times = points.map((point) => new Date(point.t).getTime())

    expect(times).toEqual([...times].sort((a, b) => a - b))
  })
})

describe('podsumowanie', () => {
  it('snapshot jest ucięty do pełnej godziny', () => {
    expect(snapshotTime(NOW).getMinutes()).toBe(0)
    expect(snapshotTime(NOW).getSeconds()).toBe(0)
  })

  it('total jest sumą pozycji, a źródła sumą swoich pozycji', () => {
    const summary = summaryFixture('USD', { now: NOW })
    const positionsTotal = summary.positions.reduce((sum, position) => sum + position.value, 0)

    expect(summary.total).toBeCloseTo(positionsTotal, 2)
    expect(summary.sources.reduce((sum, source) => sum + source.value, 0)).toBeCloseTo(
      summary.total,
      2,
    )
    expect(summary.positions.reduce((sum, position) => sum + position.pct, 0)).toBeCloseTo(1, 10)
  })

  it('PLN jest przeliczone kursem z fixtures', () => {
    const usd = summaryFixture('USD', { now: NOW })
    const pln = summaryFixture('PLN', { now: NOW })

    expect(pln.total).toBeCloseTo(usd.total * PLN_RATE, 0)
    expect(pln.change.h24?.pct).toBeCloseTo(usd.change.h24?.pct ?? 0, 10)
  })

  it('ATH nie jest niższe od bieżącej wartości', () => {
    const summary = summaryFixture('USD', { now: NOW })

    expect(summary.ath.value).toBeGreaterThanOrEqual(summary.total)
  })

  // Hero i kafelki nie mogą pokazywać zmiany przeciwnej do tego, co widać
  // na wykresie. Dokładnej równości nie ma: pierwszy punkt zakresu leży
  // o jeden krok bliżej teraźniejszości niż granica okna zmiany.
  it.each([
    ['24H', 'h24'],
    ['7D', 'd7'],
    ['30D', 'd30'],
  ] as const)('zmiana %s ma ten sam kierunek co krzywa', (range, key) => {
    const summary = summaryFixture('USD', { now: NOW })
    const history = historyFixture(range, 'USD', { now: NOW })

    const first = history.points[0]?.value ?? 0
    const fromCurve = summary.total - first
    const fromSummary = summary.change[key]?.abs ?? 0

    expect(Math.sign(fromSummary)).toBe(Math.sign(fromCurve))
    expect(Math.abs(fromSummary - fromCurve) / Math.abs(fromCurve)).toBeLessThan(0.2)
  })

  it('wariant niepełny oznacza snapshot i jedną pozycję', () => {
    const summary = summaryFixture('USD', { now: NOW, incomplete: true })
    const history = historyFixture('30D', 'USD', { now: NOW, incomplete: true })

    expect(summary.complete).toBe(false)
    expect(summary.positions.filter((position) => position.stale)).toHaveLength(1)
    expect(history.points.at(-1)?.complete).toBe(false)
  })
})
