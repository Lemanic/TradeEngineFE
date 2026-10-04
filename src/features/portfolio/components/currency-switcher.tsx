import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { CURRENCIES, type Currency } from '../types'

type CurrencySwitcherProps = {
  value: Currency
  onChange: (currency: Currency) => void
}

export function CurrencySwitcher({ value, onChange }: CurrencySwitcherProps) {
  return (
    <ToggleGroup
      type="single"
      size="sm"
      variant="outline"
      value={value}
      aria-label="Waluta"
      onValueChange={(next) => {
        if (next) onChange(next as Currency)
      }}
    >
      {CURRENCIES.map((currency) => (
        <ToggleGroupItem key={currency} value={currency} aria-label={currency} className="px-2.5">
          {currency}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
