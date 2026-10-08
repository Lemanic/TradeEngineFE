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

/**
 * Kolor jest przypisany na stałe do nazwy źródła, nie do jego pozycji
 * w rankingu. Każde **realne** źródło musi tu być wpisane: nazwa nieznana
 * z rejestru dostaje wolny slot alfabetycznie, więc jej kolor zmieniłby się
 * w chwili, gdy dojdzie albo zniknie inne źródło — dokładnie to, czemu ten
 * rejestr ma zapobiegać.
 *
 * Slot 5 (róż) jest celowo pominięty przy źródłach, które współistnieją
 * z `Trezor`: zmierzone `validate_palette.js` (dataviz, `--pairs all`) daje
 * dla pary róż–pomarańcz ΔE 12,9 przy pełnym widzeniu barw, czyli poniżej
 * progu 15 — hard fail. W donucie każda para jest potencjalnie sąsiednia,
 * bo kolejność wycinków zależy od wartości.
 *
 * ZMIERZONY LIMIT LICZBY KOLORÓW (`validate_palette.js --pairs all`, oba
 * motywy, powierzchnie kart `#ffffff` i `#171717`):
 *
 * - **3 źródła**: slots 1-2-3 zdają wszystko.
 * - **4 źródła**: zdają dokładnie dwa zestawy — `{1,4,5,6}` i `{4,5,6,7}`.
 *   Obecny `{1,2,3,4}` oblewa próg pełnego widzenia na parze amber-pomarańcz
 *   (ΔE 13,7 wobec progu 15). Pomarańcz slotu 2 jest tu winowajcą: zderza się
 *   i z amberem, i z ciemną zielenią przy protanopii.
 * - **5 źródeł**: **żaden** podzbiór udokumentowanej ósemki nie zdaje w obu
 *   motywach. Przeszukane wszystkie 56 kombinacji.
 *
 * To nie jest brak dobrych hexów, a wiążący limit liczby serii: skill dataviz
 * stwierdza to wprost („more than three series in an all-pairs form means
 * fewer series or facets — not a palette change”). Donut traktujemy jako formę
 * all-pairs, bo kolejność wycinków zależy od wartości, więc każda para może
 * stać się sąsiednią. Przy piątym źródle trzeba zmienić formę wykresu albo
 * liczbę kolorowanych serii — nie wartości kolorów.
 *
 * Tożsamości nie niesie tu jednak sam kolor: każdy wycinek ma etykietę
 * w liście obok donuta (nazwa, udział, kwota), co jest wymogiem, nie ozdobą.
 */
const REGISTERED_SLOTS: Record<string, number> = {
  Rabby: 1,
  Trezor: 2,
  Hyperliquid: 3,
  'TAO staking': 4,
  'TRB staking': 6,
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
