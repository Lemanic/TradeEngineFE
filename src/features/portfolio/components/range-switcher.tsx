import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { RANGE_LABELS, RANGES, type Range } from '../types'

type RangeSwitcherProps = {
  value: Range
  onChange: (range: Range) => void
}

export function RangeSwitcher({ value, onChange }: RangeSwitcherProps) {
  return (
    <ToggleGroup
      type="single"
      size="sm"
      variant="outline"
      value={value}
      aria-label="Zakres wykresu"
      onValueChange={(next) => {
        // Radix zwraca "" przy kliknięciu w aktywny element — zakres musi zostać wybrany.
        if (next) onChange(next as Range)
      }}
      className="max-w-full overflow-x-auto"
    >
      {RANGES.map((range) => (
        <ToggleGroupItem
          key={range}
          value={range}
          aria-label={RANGE_LABELS[range]}
          className="px-2.5"
        >
          {range}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
