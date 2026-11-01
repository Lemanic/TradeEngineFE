import { useId, useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts'
import type { TooltipContentProps } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

import { niceScale, percentScale, type PercentScale } from '../chart-scale'
import { formatAxisPercent, formatAxisTick, formatPointLabel, formatSignedPercent } from '../format'
import { RANGE_LABELS, type Currency, type History, type HistoryPoint, type Range } from '../types'
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

  /**
   * W trybie prywatnym kwoty z osi znikają, ale kształt krzywej zostaje — bez
   * żadnej skali nie da się jej odczytać. Procent wobec początku zakresu nie
   * zdradza wielkości portfela, więc oś przełączamy, a nie chowamy.
   */
  const percent = useMemo(
    () => (money.isPrivate ? percentScale(history.points) : null),
    [money.isPrivate, history.points],
  )

  return (
    <Card className="min-w-0">
      <CardHeader className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle>Wartość portfela</CardTitle>
          {percent && (
            <CardDescription className="mt-1">
              zmiana % od początku okresu · {RANGE_LABELS[range]}
            </CardDescription>
          )}
        </div>
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
              /* Bez skali procentowej (portfel wystartował od zera) oś nie ma
                 co pokazać w trybie prywatnym — wtedy znika jak wcześniej. */
              hide={money.isPrivate && !percent}
              /* Etykieta „47,9 tys.” potrzebuje miejsca — przy węższej osi ucina się.
                 Procent („+2,5%”) mieści się w połowie tego. */
              width={percent ? 52 : 72}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={percent ? percent.domain : scale.domain}
              ticks={percent ? percent.ticks : scale.ticks}
              tickFormatter={
                percent
                  ? (value: number) => formatAxisPercent(percent.pctOf(value))
                  : money.axisMoney
              }
            />

            {/* Linia zera: pozwala odczytać wzrost i spadek bez liczenia po tickach. */}
            {percent && (
              <ReferenceLine
                y={percent.base}
                stroke="var(--chart-axis)"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
            )}

            <ChartTooltip
              cursor={{ stroke: 'var(--chart-axis)', strokeWidth: 1 }}
              content={(props: TooltipContentProps) => {
                if (!props.active) return null
                const point = toPoint(props.payload?.[0]?.payload)
                if (!point) return null

                return (
                  <ValueTooltipContent
                    point={point}
                    range={range}
                    currency={currency}
                    percent={percent}
                  />
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

type ValueTooltipContentProps = {
  point: HistoryPoint
  range: Range
  currency: Currency
  /** Skala procentowa trybu prywatnego; `null` poza nim. */
  percent: PercentScale | null
}

/**
 * Treść tooltipa wykresu. Osobny komponent, bo Recharts w jsdom nie renderuje
 * wykresu (kontener ma zerowe wymiary) — inaczej nie dałoby się jej przetestować.
 *
 * W trybie prywatnym pokazuje procent wobec początku okresu zamiast maski:
 * sama maska `•••••` w tooltipie nie niosła żadnej informacji.
 */
export function ValueTooltipContent({ point, range, currency, percent }: ValueTooltipContentProps) {
  const money = useMoney(currency)

  return (
    <div className="grid gap-1 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md">
      <span className="text-sm font-semibold num">
        {percent ? formatSignedPercent(percent.pctOf(point.value)) : money.money(point.value)}
      </span>
      <span className="text-muted-foreground">{formatPointLabel(point.t, range)}</span>
      {!point.complete && <span className="text-muted-foreground">snapshot niepełny</span>}
    </div>
  )
}
