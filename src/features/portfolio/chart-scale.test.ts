import { describe, expect, it } from 'vitest'

import { niceScale, percentScale } from './chart-scale'

describe('niceScale', () => {
  it('zaokrągla zakres do równych kroków', () => {
    const { domain, ticks } = niceScale([46780, 48881, 47500])

    expect(domain).toEqual([46000, 49000])
    expect(ticks).toEqual([46000, 47000, 48000, 49000])
  })

  it('obejmuje całą serię', () => {
    const values = [47487, 47915, 47600]
    const { domain } = niceScale(values)

    expect(domain[0]).toBeLessThanOrEqual(Math.min(...values))
    expect(domain[1]).toBeGreaterThanOrEqual(Math.max(...values))
  })

  it('radzi sobie z płaską serią i pustą tablicą', () => {
    expect(niceScale([100, 100]).domain[0]).toBeLessThanOrEqual(100)
    expect(niceScale([]).ticks.length).toBeGreaterThan(0)
  })
})

describe('percentScale', () => {
  const point = (value: number, complete = true) => ({ value, complete })

  it('daje okrągłe kroki w procentach, nie w kwotach', () => {
    const scale = percentScale([point(50_000), point(51_500), point(53_000)])

    expect(scale).not.toBeNull()
    expect(scale?.base).toBe(50_000)
    expect(scale?.ticks.map((tick) => scale.pctOf(tick))).toEqual([0, 0.02, 0.04, 0.06])
  })

  it('obejmuje spadki poniżej bazy', () => {
    const scale = percentScale([point(50_000), point(47_000)])

    expect(scale?.pctOf(scale.domain[0])).toBeLessThanOrEqual(-0.06)
    expect(scale?.pctOf(scale.domain[1])).toBeGreaterThanOrEqual(0)
  })

  it('bazuje na pierwszym pełnym snapshocie, nie na pierwszym w kolejności', () => {
    // Niepełny snapshot ma zaniżoną wartość — jako baza wypchnąłby całą
    // krzywą nad linię zera.
    const scale = percentScale([point(30_000, false), point(50_000), point(51_000)])

    expect(scale?.base).toBe(50_000)
    expect(scale?.pctOf(30_000)).toBeCloseTo(-0.4, 6)
  })

  it('bierze pierwszy dodatni punkt, gdy żaden snapshot nie jest pełny', () => {
    expect(percentScale([point(0, false), point(40_000, false)])?.base).toBe(40_000)
  })

  it('nie istnieje bez dodatniej bazy — procent z zera nie ma sensu', () => {
    expect(percentScale([])).toBeNull()
    expect(percentScale([point(0), point(0)])).toBeNull()
  })

  it('płaskiej serii daje pasmo wokół zera', () => {
    const scale = percentScale([point(50_000), point(50_000)])

    expect(scale?.pctOf(scale.domain[0])).toBeLessThan(0)
    expect(scale?.pctOf(scale.domain[1])).toBeGreaterThan(0)
    expect(scale?.ticks.map((tick) => scale.pctOf(tick))).toContain(0)
  })
})
