/**
 * Zamiast logotypów — kółko z symbolem aktywa. Jest etykietą pozycji,
 * nie dekoracją, więc czytniki ekranu muszą je widzieć.
 */
export function AssetMark({ asset }: { asset: string }) {
  return (
    <span
      title={asset}
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-[0.6rem] font-semibold tracking-tight text-foreground"
    >
      {asset}
    </span>
  )
}
