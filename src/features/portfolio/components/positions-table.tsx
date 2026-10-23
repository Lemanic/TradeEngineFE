import { ArrowDown, ArrowUp } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from 'cn'

import { nextSort, type PositionSort, type PositionSortKey } from '../aggregate'
import { formatShare } from '../format'
import type { Currency, Position } from '../types'
import { useMoney } from '../use-money'
import { AssetMark } from './asset-mark'
import { StaleBadge } from './stale-badge'

type PositionsTableProps = {
  positions: Position[]
  currency: Currency
  sort: PositionSort
  onSortChange: (sort: PositionSort) => void
}

const COLUMNS: ReadonlyArray<{
  key: PositionSortKey
  label: string
  numeric: boolean
}> = [
  { key: 'asset', label: 'Aktywo', numeric: false },
  { key: 'source', label: 'Źródło / sieć', numeric: false },
  { key: 'amount', label: 'Ilość', numeric: true },
  { key: 'price', label: 'Cena', numeric: true },
  { key: 'value', label: 'Wartość', numeric: true },
]

export function PositionsTable({ positions, currency, sort, onSortChange }: PositionsTableProps) {
  const money = useMoney(currency)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {COLUMNS.map((column) => {
            const isActive = sort.key === column.key
            const Icon = sort.direction === 'asc' ? ArrowUp : ArrowDown

            return (
              <TableHead
                key={column.key}
                aria-sort={
                  isActive ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'
                }
                className={cn(column.numeric && 'text-right')}
              >
                <button
                  type="button"
                  onClick={() => onSortChange(nextSort(sort, column.key))}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-sm hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                    column.numeric && 'flex-row-reverse',
                    isActive && 'font-medium text-foreground',
                  )}
                >
                  {column.label}
                  {isActive && <Icon aria-hidden="true" className="size-3" />}
                </button>
              </TableHead>
            )
          })}
          <TableHead className="text-right">% portfela</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((position) => (
          <TableRow key={`${position.source}-${position.network}-${position.asset}`}>
            <TableCell>
              <div className="flex items-center gap-2">
                <AssetMark asset={position.asset} />
                {position.stale && <StaleBadge />}
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              <span className="text-foreground">{position.source}</span>
              <span className="block text-xs">{position.network}</span>
            </TableCell>
            <TableCell className="text-right num">{money.quantity(position.amount)}</TableCell>
            <TableCell className="text-right num">{money.price(position.price)}</TableCell>
            <TableCell className="text-right font-medium num">
              {money.money(position.value)}
            </TableCell>
            <TableCell className="text-right num text-muted-foreground">
              {formatShare(position.pct)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
