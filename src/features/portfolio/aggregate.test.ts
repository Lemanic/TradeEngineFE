import { describe, expect, it } from 'vitest'

import {
  DEFAULT_POSITION_SORT,
  groupSources,
  MAX_DONUT_SLICES,
  nextSort,
  sortPositions,
} from './aggregate'
import { OTHER_SOURCE_NAME } from './palette'
import type { Position, Source } from './types'

function source(name: string, value: number, pct: number): Source {
  return { name, value, pct }
}

function position(asset: string, source: string, value: number, amount: number): Position {
  return {
    source,
    network: 'ethereum',
    asset,
    amount,
    price: amount === 0 ? 0 : value / amount,
    value,
    pct: 0,
    stale: false,
  }
}

describe('groupSources', () => {
  it('sortuje malejąco i nie scala, gdy źródeł jest najwyżej sześć', () => {
    const grouped = groupSources([
      source('TRB staking', 2400, 0.05),
      source('Rabby', 20198, 0.42),
      source('Trezor', 15300, 0.32),
    ])

    expect(grouped.map((item) => item.name)).toEqual(['Rabby', 'Trezor', 'TRB staking'])
    expect(grouped).toHaveLength(3)
  })

  it('scala najmniejsze źródła w „Inne”, gdy jest ich więcej niż sześć', () => {
    const many = [
      source('A', 100, 0.4),
      source('B', 80, 0.2),
      source('C', 60, 0.15),
      source('D', 40, 0.1),
      source('E', 20, 0.08),
      source('F', 10, 0.05),
      source('G', 5, 0.02),
    ]

    const grouped = groupSources(many)

    expect(grouped).toHaveLength(MAX_DONUT_SLICES)
    expect(grouped.at(-1)?.name).toBe(OTHER_SOURCE_NAME)
    // „Inne” zbiera F i G.
    expect(grouped.at(-1)?.value).toBe(15)
    expect(grouped.at(-1)?.pct).toBeCloseTo(0.07, 10)
  })

  it('zachowuje całą wartość portfela po scaleniu', () => {
    const many = Array.from({ length: 9 }, (_, index) => source(`S${index}`, 10 * (index + 1), 0.1))
    const total = many.reduce((sum, item) => sum + item.value, 0)

    expect(groupSources(many).reduce((sum, item) => sum + item.value, 0)).toBe(total)
  })
})

describe('sortPositions', () => {
  const positions = [
    position('ETH', 'Rabby', 9001.35, 2.41),
    position('BCH', 'Trezor', 11000.05, 21.5),
    position('TAO', 'TAO staking', 10000.8, 27.78),
  ]

  it('domyślnie sortuje malejąco po wartości', () => {
    expect(sortPositions(positions, DEFAULT_POSITION_SORT).map((item) => item.asset)).toEqual([
      'BCH',
      'TAO',
      'ETH',
    ])
  })

  it('sortuje rosnąco po wartości', () => {
    expect(
      sortPositions(positions, { key: 'value', direction: 'asc' }).map((item) => item.asset),
    ).toEqual(['ETH', 'TAO', 'BCH'])
  })

  it('sortuje po nazwie aktywa i po ilości', () => {
    expect(
      sortPositions(positions, { key: 'asset', direction: 'asc' }).map((item) => item.asset),
    ).toEqual(['BCH', 'ETH', 'TAO'])
    expect(
      sortPositions(positions, { key: 'amount', direction: 'desc' }).map((item) => item.asset),
    ).toEqual(['TAO', 'BCH', 'ETH'])
  })

  it('nie modyfikuje tablicy wejściowej', () => {
    const input = [...positions]
    sortPositions(input, { key: 'asset', direction: 'asc' })
    expect(input.map((item) => item.asset)).toEqual(['ETH', 'BCH', 'TAO'])
  })
})

describe('nextSort', () => {
  it('nowa kolumna liczbowa startuje malejąco, tekstowa rosnąco', () => {
    expect(nextSort({ key: 'value', direction: 'desc' }, 'amount')).toEqual({
      key: 'amount',
      direction: 'desc',
    })
    expect(nextSort({ key: 'value', direction: 'desc' }, 'asset')).toEqual({
      key: 'asset',
      direction: 'asc',
    })
  })

  it('ta sama kolumna odwraca kierunek', () => {
    expect(nextSort({ key: 'value', direction: 'desc' }, 'value')).toEqual({
      key: 'value',
      direction: 'asc',
    })
  })
})
