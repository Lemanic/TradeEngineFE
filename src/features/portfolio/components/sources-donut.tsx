import { useMemo, useState } from 'react'
import { Cell, Pie, PieChart } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from 'cn'

import { groupSources } from '../aggregate'
import { formatShare } from '../format'
import { sourceColorsFor } from '../palette'
import type { Currency, Source } from '../types'
import { useMoney } from '../use-money'

type SourcesDonutProps = {
  sources: Source[]
  total: number
  currency: Currency
}

export function SourcesDonut({ sources, total, currency }: SourcesDonutProps) {
  const [activeName, setActiveName] = useState<string | null>(null)
  const money = useMoney(currency)
  const prefersReducedMotion = usePrefersReducedMotion()

  const slices = useMemo(() => groupSources(sources), [sources])
  const colors = useMemo(() => sourceColorsFor(slices), [slices])

  /**
   * Konfiguracja nosi tylko etykiety. Kolor podajemy wprost na `<Cell>`, bo
   * shadcn zamienia klucze configu na nazwy zmiennych CSS, a nazwy źródeł
   * mają spacje („TAO staking”) — powstałby niepoprawny arkusz stylów.
   */
  const config = useMemo<ChartConfig>(
    () => Object.fromEntries(slices.map((slice) => [slice.name, { label: slice.name }])),
    [slices],
  )

  const active = slices.find((slice) => slice.name === activeName) ?? null

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Podział na źródła</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mx-auto aspect-square w-full max-w-[260px]">
          <ChartContainer config={config} className="aspect-square h-full w-full">
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                innerRadius="64%"
                outerRadius="94%"
                startAngle={90}
                endAngle={-270}
                isAnimationActive={!prefersReducedMotion}
                animationDuration={320}
                onMouseEnter={(_, index) => setActiveName(slices[index]?.name ?? null)}
                onMouseLeave={() => setActiveName(null)}
              >
                {slices.map((slice) => (
                  <Cell
                    key={slice.name}
                    fill={colors.get(slice.name)}
                    /* 2 px przerwy w kolorze karty rozdzielają wycinki. */
                    stroke="var(--card)"
                    strokeWidth={2}
                    fillOpacity={activeName === null || activeName === slice.name ? 1 : 0.3}
                    className="transition-opacity"
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
          >
            <span className="text-xl font-semibold num">
              {money.compactMoney(active ? active.value : total)}
            </span>
            <span className="mt-0.5 max-w-[60%] truncate text-xs text-muted-foreground">
              {active ? `${active.name} · ${formatShare(active.pct)}` : 'razem'}
            </span>
          </div>
        </div>

        <ul className="mt-4 space-y-0.5">
          {slices.map((slice) => (
            <li key={slice.name}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  activeName === slice.name ? 'bg-muted' : 'hover:bg-muted/60',
                )}
                onMouseEnter={() => setActiveName(slice.name)}
                onMouseLeave={() => setActiveName(null)}
                onFocus={() => setActiveName(slice.name)}
                onBlur={() => setActiveName(null)}
              >
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: colors.get(slice.name) }}
                />
                <span className="min-w-0 flex-1 truncate text-sm">{slice.name}</span>
                <span className="text-sm num text-muted-foreground">{formatShare(slice.pct)}</span>
                <span className="w-28 text-right text-sm font-medium num">
                  {money.money(slice.value)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
