/**
 * Zamiast logotypów — kółko z symbolem aktywa. Jest etykietą pozycji,
 * nie dekoracją, więc czytniki ekranu muszą je widzieć.
 *
 * Kształt jest pigułką o stałej wysokości, nie kołem o stałej średnicy:
 * do czterech znaków (`ETH`, `USDC`) wypada dokładnie kołem, bo szerokość
 * minimalna równa się wysokości, a dłuższe symbole (`PENGU`, zawijane
 * tokeny z sufiksem) rozpychają je w boki, zamiast wylewać się za krawędź
 * albo kurczyć font do nieczytelnego stopnia. Długość symbolu nie jest
 * więc założeniem widoku — backend może przysłać dowolny.
 */
export function AssetMark({ asset }: { asset: string }) {
  return (
    <span
      title={asset}
      className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-muted px-1.5 text-[0.6rem] font-semibold tracking-tight text-foreground"
    >
      {asset}
    </span>
  )
}
