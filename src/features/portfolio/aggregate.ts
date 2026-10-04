import { OTHER_SOURCE_NAME } from './palette'
import type { Position, Source } from './types'

/**
 * Donut części-do-całości czyta się tylko przy małej liczbie segmentów,
 * więc ring nigdy nie przekracza 6 wycinków: top 5 + „Inne”.
 */
export const MAX_DONUT_SLICES = 6

export function groupSources(sources: readonly Source[]): Source[] {
  const sorted = [...sources].sort((a, b) => b.value - a.value)

  if (sorted.length <= MAX_DONUT_SLICES) {
    return sorted
  }

  const visible = sorted.slice(0, MAX_DONUT_SLICES - 1)
  const rest = sorted.slice(MAX_DONUT_SLICES - 1)

  const other: Source = {
    name: OTHER_SOURCE_NAME,
    value: rest.reduce((sum, source) => sum + source.value, 0),
    pct: rest.reduce((sum, source) => sum + source.pct, 0),
  }

  return [...visible, other]
}

export type PositionSortKey = 'asset' | 'source' | 'amount' | 'price' | 'value'

export type SortDirection = 'asc' | 'desc'

export type PositionSort = {
  key: PositionSortKey
  direction: SortDirection
}

export const DEFAULT_POSITION_SORT: PositionSort = { key: 'value', direction: 'desc' }

export function sortPositions(positions: readonly Position[], sort: PositionSort): Position[] {
  const factor = sort.direction === 'asc' ? 1 : -1

  return [...positions].sort((a, b) => {
    switch (sort.key) {
      case 'asset':
        return factor * a.asset.localeCompare(b.asset, 'pl')
      case 'source':
        // Przy tym samym źródle rozstrzyga sieć — inaczej kolejność skakałaby losowo.
        return (
          factor *
          (a.source.localeCompare(b.source, 'pl') || a.network.localeCompare(b.network, 'pl'))
        )
      case 'amount':
        return factor * (a.amount - b.amount)
      case 'price':
        return factor * (a.price - b.price)
      case 'value':
        return factor * (a.value - b.value)
    }
  })
}

/** Kliknięcie w nagłówek: ta sama kolumna odwraca kierunek, nowa startuje malejąco. */
export function nextSort(current: PositionSort, key: PositionSortKey): PositionSort {
  if (current.key !== key) {
    return { key, direction: key === 'asset' || key === 'source' ? 'asc' : 'desc' }
  }
  return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
}
