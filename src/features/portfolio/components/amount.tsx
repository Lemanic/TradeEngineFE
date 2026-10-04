import { cn } from 'cn'

import { useMoney } from '../use-money'
import type { Currency } from '../types'

type AmountProps = {
  value: number
  currency: Currency
  /** „47,9 tys. USD” zamiast pełnej kwoty. */
  compact?: boolean
  signed?: boolean
  className?: string
}

/** Każda kwota w widoku przechodzi przez ten komponent — stąd tryb prywatny. */
export function Amount({
  value,
  currency,
  compact = false,
  signed = false,
  className,
}: AmountProps) {
  const money = useMoney(currency)

  const text = signed
    ? money.signedMoney(value)
    : compact
      ? money.compactMoney(value)
      : money.money(value)

  return (
    <span
      className={cn('num', className)}
      aria-label={money.isPrivate ? 'kwota ukryta' : undefined}
    >
      {text}
    </span>
  )
}
