import type { Source } from './types'

/**
 * Paleta źródeł. Slotów kolorystycznych jest 6 (`--chart-1`…`--chart-6`),
 * grupa „Inne” dostaje neutralną szarość — „wszystko pozostałe” nie jest
 * tożsamością, więc nie zużywa slotu.
 *
 * Wartości i walidację (CVD, kontrast, pasmo jasności) opisuje CLAUDE.md.
 */

export const OTHER_SOURCE_NAME = 'Inne'

export const OTHER_SOURCE_COLOR = 'var(--chart-other)'

const SLOT_COUNT = 6

/** Kolor jest przypisany na stałe do nazwy źródła, nie do jego pozycji w rankingu. */
const REGISTERED_SLOTS: Record<string, number> = {
  Rabby: 1,
  Trezor: 2,
  'TAO staking': 3,
  'TRB staking': 4,
}

function slotColor(slot: number): string {
  return `var(--chart-${slot})`
}

/**
 * Mapuje nazwy źródeł na kolory. Nazwy nieznane z rejestru dostają wolne sloty
 * w kolejności alfabetycznej — nigdy w kolejności wartości, bo wtedy filtr albo
 * zmiana kursu przemalowałaby wykres.
 */
export function resolveSourceColors(names: readonly string[]): Map<string, string> {
  const colors = new Map<string, string>()
  const taken = new Set<number>()

  const named = names.filter((name) => name !== OTHER_SOURCE_NAME)

  for (const name of named) {
    const slot = REGISTERED_SLOTS[name]
    if (slot !== undefined) {
      colors.set(name, slotColor(slot))
      taken.add(slot)
    }
  }

  const unknown = named.filter((name) => !colors.has(name)).sort((a, b) => a.localeCompare(b, 'pl'))

  let nextSlot = 1
  for (const name of unknown) {
    while (taken.has(nextSlot) && nextSlot <= SLOT_COUNT) nextSlot += 1
    colors.set(name, slotColor(Math.min(nextSlot, SLOT_COUNT)))
    taken.add(nextSlot)
    nextSlot += 1
  }

  if (names.includes(OTHER_SOURCE_NAME)) {
    colors.set(OTHER_SOURCE_NAME, OTHER_SOURCE_COLOR)
  }

  return colors
}

export function sourceColorsFor(sources: readonly Source[]): Map<string, string> {
  return resolveSourceColors(sources.map((source) => source.name))
}
