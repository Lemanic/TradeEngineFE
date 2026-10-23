import { formatShare } from '../format'
import type { Currency, Position } from '../types'
import { useMoney } from '../use-money'
import { AssetMark } from './asset-mark'
import { StaleBadge } from './stale-badge'

type PositionsCardsProps = {
  positions: Position[]
  currency: Currency
}

/**
 * Wariant telefonowy tabeli — te same dane, układ kart.
 * Symbol aktywa nosi kółko, więc nie powtarzamy go w treści karty.
 */
export function PositionsCards({ positions, currency }: PositionsCardsProps) {
  const money = useMoney(currency)

  return (
    <ul className="divide-y divide-border">
      {positions.map((position) => (
        <li
          key={`${position.source}-${position.network}-${position.asset}`}
          className="flex items-start gap-3 py-3"
        >
          <AssetMark asset={position.asset} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 truncate text-sm text-foreground">
                {position.source} · {position.network}
              </span>
              <span className="shrink-0 font-medium num">{money.money(position.value)}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
              <span className="min-w-0 truncate num">
                {money.quantity(position.amount)} × {money.price(position.price)}
              </span>
              <span className="shrink-0 num">{formatShare(position.pct)}</span>
            </div>
            {position.stale && (
              <p className="mt-1.5">
                <StaleBadge />
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
