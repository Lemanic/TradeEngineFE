import { Card, CardContent } from '@/components/ui/card'

import { formatDate, formatSignedPercent } from '../format'
import type { Currency, Summary } from '../types'
import { Amount } from './amount'
import { Delta } from './delta'

type KpiTilesProps = {
  change: Summary['change']
  ath: Summary['ath']
  total: number
  currency: Currency
}

export function KpiTiles({ change, ath, total, currency }: KpiTilesProps) {
  // Spadek od ATH jest zawsze <= 0, więc znak nadaje mu kierunek bez koloru.
  const drawdown = ath.value > 0 ? total / ath.value - 1 : 0

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <KpiTile label="24 godziny">
        <Delta change={change.h24} currency={currency} />
      </KpiTile>
      <KpiTile label="7 dni">
        <Delta change={change.d7} currency={currency} />
      </KpiTile>
      <KpiTile label="30 dni">
        <Delta change={change.d30} currency={currency} />
      </KpiTile>
      <KpiTile label="Maksimum (ATH)">
        <span className="text-base font-medium num">
          <Amount value={ath.value} currency={currency} />
        </span>
        <span className="block text-xs num text-muted-foreground">
          {formatDate(ath.at)} · {formatSignedPercent(drawdown)} od ATH
        </span>
      </KpiTile>
    </div>
  )
}

function KpiTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card className="gap-0 py-4">
      <CardContent className="px-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-1.5">{children}</div>
      </CardContent>
    </Card>
  )
}
