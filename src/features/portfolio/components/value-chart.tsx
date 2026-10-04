import { useId, useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { TooltipContentProps } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

import { niceScale } from '../chart-scale'
import { formatAxisTick, formatPointLabel } from '../format'
import type { Currency, History, HistoryPoint, Range } from '../types'
import { useMoney } from '../use-money'
import { RangeSwitcher } from './range-switcher'

type ValueChartProps = {
  history: History
  currency: Currency
  range: Range
  onRangeChange: (range: Range) => void
}

const CHART_CONFIG = {
  value: { label: 'Wartość portfela', color: 'var(--chart-1)' },
} satisfies ChartConfig

/** Payload Rechartsa jest nietypowany — zawężamy go zamiast rzutować na `any`. */
function toPoint(value: unknown): HistoryPoint | null {
  if (typeof value !== 'object' || value === null) return null
  const record = value as Record<string, unknown>
  if (typeof record.t !== 'string' || typeof record.value !== 'number') return null
  return { t: record.t, value: record.value, complete: record.complete !== false }
}

export function ValueChart({ history, currency, range, onRangeChange }: ValueChartProps) {
  const gradientId = useId().replace(/:/g, '')
  const money = useMoney(currency)
  const prefersReducedMotion = usePrefersReducedMotion()

  const scale = useMemo(
    () => niceScale(history.points.map((point) => point.value)),
    [history.points],
  )

  return (
    <Card className="min-w-0">
      <CardHeader className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Wartość portfela</CardTitle>
        <RangeSwitcher value={range} onChange={onRangeChange} />
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        <ChartContainer
          config={CHART_CONFIG}
          className="aspect-auto h-[220px] w-full sm:h-[320px] [&_.recharts-cartesian-axis-tick_text]:fill-chart-axis"
        >
          <AreaChart
            data={history.points}
            margin={{ top: 8, right: 8, bottom: 0, left: 4 }}
            accessibilityLayer
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Siatka cienka, ciągła i tylko pozioma — ma być recesywna. */}
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeWidth={1} />

            <XAxis
              dataKey="t"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) => formatAxisTick(value, range)}
            />
            <YAxis
              hide={money.isPrivate}
              /* Etykieta „47,9 tys.” potrzebuje miejsca — przy węższej osi ucina się. */
              width={72}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={scale.domain}
              ticks={scale.ticks}
              tickFormatter={money.axisMoney}
            />

            <ChartTooltip
              cursor={{ stroke: 'var(--chart-axis)', strokeWidth: 1 }}
              content={(props: TooltipContentProps) => {
                if (!props.active) return null
                const point = toPoint(props.payload?.[0]?.payload)
                if (!point) return null

                return (
                  <div className="grid gap-1 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md">
                    <span className="text-sm font-semibold num">{money.money(point.value)}</span>
                    <span className="text-muted-foreground">
                      {formatPointLabel(point.t, range)}
                    </span>
                    {!point.complete && (
                      <span className="text-muted-foreground">snapshot niepełny</span>
                    )}
                  </div>
                )
              }}
            />

            <Area
              dataKey="value"
              type="monotone"
              stroke="var(--chart-1)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={`url(#${gradientId})`}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)', fill: 'var(--chart-1)' }}
              isAnimationActive={!prefersReducedMotion}
              animationDuration={320}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
