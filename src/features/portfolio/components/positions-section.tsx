import { ArrowDownUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { nextSort, type PositionSort, type PositionSortKey } from '../aggregate'
import type { Currency, Position } from '../types'
import { PositionsCards } from './positions-cards'
import { PositionsTable } from './positions-table'

type PositionsSectionProps = {
  positions: Position[]
  currency: Currency
  sort: PositionSort
  onSortChange: (sort: PositionSort) => void
}

const SORT_LABELS: Record<PositionSortKey, string> = {
  asset: 'Aktywo',
  source: 'Źródło',
  amount: 'Ilość',
  price: 'Cena',
  value: 'Wartość',
}

const SORT_KEYS: readonly PositionSortKey[] = ['value', 'asset', 'source', 'amount', 'price']

function isSortKey(value: string): value is PositionSortKey {
  return value in SORT_LABELS
}

export function PositionsSection({
  positions,
  currency,
  sort,
  onSortChange,
}: PositionsSectionProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Pozycje</CardTitle>

        {/* Na telefonie nie ma nagłówków tabeli, więc sortowanie dostaje własną kontrolkę. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="md:hidden">
            <Button variant="outline" size="sm">
              <ArrowDownUp aria-hidden="true" />
              {SORT_LABELS[sort.key]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={sort.key}
              onValueChange={(next) => {
                if (isSortKey(next)) onSortChange(nextSort(sort, next))
              }}
            >
              {SORT_KEYS.map((key) => (
                <DropdownMenuRadioItem key={key} value={key}>
                  {SORT_LABELS[key]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        <div className="hidden md:block">
          <PositionsTable
            positions={positions}
            currency={currency}
            sort={sort}
            onSortChange={onSortChange}
          />
        </div>
        <div className="md:hidden">
          <PositionsCards positions={positions} currency={currency} />
        </div>
      </CardContent>
    </Card>
  )
}
