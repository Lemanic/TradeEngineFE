import { describe, expect, it } from 'vitest'

import { niceScale } from './chart-scale'

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
