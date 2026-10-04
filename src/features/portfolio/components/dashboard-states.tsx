import { RefreshCw, TriangleAlert } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/** Szkielety mają kształt docelowych elementów, żeby układ nie skakał. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Ładowanie danych portfela">
      <div className="space-y-3 py-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-5 w-56" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Card key={index} className="gap-0 py-4">
            <CardContent className="space-y-2 px-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-7 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[220px] w-full sm:h-[320px]" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="mx-auto aspect-square w-full max-w-[260px] rounded-full" />
            <div className="space-y-2">
              {[0, 1, 2, 3].map((index) => (
                <Skeleton key={index} className="h-7 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[0, 1, 2, 3, 4].map((index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert>
      <TriangleAlert aria-hidden="true" className="text-destructive" />
      <AlertTitle className="text-destructive">Nie udało się pobrać danych portfela</AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-3">
        <span>
          Backend TradeEngine nie odpowiedział. Dane demo nie zostaną podstawione — zobaczysz
          wyłącznie prawdziwe wartości.
        </span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw aria-hidden="true" />
          Spróbuj ponownie
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export function DashboardEmpty() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="font-medium">Brak danych portfela</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Pierwszy snapshot pojawi się o pełnej godzinie.
        </p>
      </CardContent>
    </Card>
  )
}
