import { Info } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { RANGE_LABELS, type Change, type Currency, type Range } from '../types'
import { Amount } from './amount'
import { Delta } from './delta'

type HeroTotalProps = {
  total: number
  currency: Currency
  change: Change | null
  range: Range
}

export function HeroTotal({ total, currency, change, range }: HeroTotalProps) {
  return (
    <section aria-labelledby="hero-label" className="py-2">
      <h2 id="hero-label" className="text-sm text-muted-foreground">
        Łączna wartość
      </h2>
      <p className="mt-1 text-4xl font-semibold num tracking-tight sm:text-5xl">
        <Amount value={total} currency={currency} />
      </p>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <Delta change={change} currency={currency} size="lg" />
        <span className="text-sm text-muted-foreground">· {RANGE_LABELS[range]}</span>
        <Tooltip>
          <TooltipTrigger
            className="rounded-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Jak liczona jest zmiana wartości"
          >
            <Info aria-hidden="true" className="size-4" />
          </TooltipTrigger>
          <TooltipContent className="max-w-64">
            Zmiana wartości uwzględnia wpłaty i wypłaty.
          </TooltipContent>
        </Tooltip>
      </p>
    </section>
  )
}
