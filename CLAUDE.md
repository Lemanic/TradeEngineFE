# CLAUDE.md

Wskazówki dla Claude Code przy pracy w tym repozytorium.

## Cel projektu

`tradeengine-dashboard` to frontend dashboardu portfela krypto dla bota **TradeEngine**:
łączna wartość, historia wartości, podział na źródła (donut) i tabela pozycji,
w motywie jasnym i ciemnym.

**Stan na teraz: widok działa wyłącznie na danych testowych.** Backend nie ma
jeszcze endpointów portfela.

## Relacja z backendem

Backend to **osobne repozytorium** (Spring Boot, lokalnie `http://localhost:8081`).

- W dev Vite proxuje `/api` na `VITE_API_TARGET` (domyślnie `http://localhost:8081`).
  Konfiguracja: `server.proxy` w `vite.config.ts`.
- Ścieżka **nie jest przepisywana**: `/api/portfolio/summary` trafia na
  `http://localhost:8081/api/portfolio/summary`.
- W kodzie frontu wołamy zawsze ścieżki relatywne (`/api/...`), nigdy pełnego
  `http://localhost:8081` — inaczej build produkcyjny przestanie być przenośny.

## Stack

| Warstwa    | Wybór                                                               |
| ---------- | ------------------------------------------------------------------- |
| Build      | Vite 8 + `@vitejs/plugin-react`                                     |
| UI         | React 19, TypeScript 6 (`strict`)                                   |
| Style      | Tailwind CSS v4 przez plugin `@tailwindcss/vite` (bez pliku config) |
| Komponenty | shadcn/ui — styl `radix-nova`, base color `neutral`, CSS variables  |
| Wykresy    | Recharts przez `components/ui/chart.tsx` z shadcn                   |
| Ikony      | `lucide-react`                                                      |
| Font       | Inter z npm (`@fontsource-variable/inter`) — zero zapytań do Google |
| Lint       | **oxlint** (szablon Vite nie dostarcza już ESLinta)                 |
| Format     | Prettier + `prettier-plugin-tailwindcss`                            |
| Testy      | Vitest + Testing Library + jsdom                                    |

## Komendy

```bash
npm run dev        # serwer dev (proxy /api aktywne)
npm run dev:mock   # dev z VITE_MOCK=1 (obsługa flagi dojdzie później)
npm run build      # tsc -b && vite build
npm run preview    # podgląd builda
npm run lint       # oxlint
npm run format     # prettier --write .
npm run typecheck  # tsc -b
npm test           # vitest run
```

Przed oddaniem zmian muszą przechodzić: `lint`, `typecheck`, `test`, `build`.

## Struktura katalogów

```
src/
├── api/                      # klienci HTTP (pusty — dojdzie z backendem)
├── components/
│   ├── ui/                   # komponenty shadcn/ui (generowane przez CLI)
│   ├── theme-provider.tsx    # motyw: system / jasny / ciemny
│   └── privacy-provider.tsx  # tryb prywatny (maskowanie kwot)
├── features/portfolio/
│   ├── types.ts              # kształt przyszłych odpowiedzi API
│   ├── fixtures.ts           # DANE TESTOWE (jedyne wymyślone liczby)
│   ├── data.ts               # useSummary / useHistory — jedyne wejście widoku
│   ├── format.ts             # Intl pl-PL: kwoty, procenty, daty
│   ├── use-money.ts          # formatowanie kwot świadome trybu prywatnego
│   ├── palette.ts            # nazwa źródła → slot --chart-N
│   ├── aggregate.ts          # top 5 + „Inne”, sortowanie pozycji
│   ├── chart-scale.ts        # okrągłe wartości na osi Y
│   └── components/           # widok (tylko propsy, zero importu fixtures)
├── hooks/                    # use-theme, use-privacy, use-prefers-reduced-motion
├── lib/                      # theme.ts, privacy.ts, utils.ts (cn)
└── test/                     # setup Vitest + wspólny render z providerami
```

Alias `@/` wskazuje na `src`. `paths` jest celowo bez `baseUrl` — TypeScript 6
oznaczył `baseUrl` jako deprecated.

## Dane testowe i podmiana na API

Przepływ danych jest jednokierunkowy i ma dokładnie jedno wejście:

```
fixtures.ts  →  data.ts (useSummary / useHistory)  →  portfolio-dashboard.tsx  →  propsy
```

- **`fixtures.ts`** — pozycje, źródła i deterministyczna historia. Historia to
  jedna bazowa seria godzinowa (~18 miesięcy), z której próbkowane są wszystkie
  zakresy, więc krzywa 24H jest końcówką krzywej 1Y. Trend opisują punkty
  zaczepienia (`TREND_ANCHORS`), szum to stacjonarny AR(1) z ziarnem.
  Ostatni punkt każdego zakresu jest **dokładnie** równy `total`, a zmiany
  24 h / 7 d / 30 d i ATH są liczone z tej serii — hero nigdy nie pokaże
  delty sprzecznej z wykresem.
- **`data.ts`** — hooki zwracają `{ data, isPending, isError, refetch }`,
  czyli kształt TanStack Query. **Podłączenie backendu to podmiana wnętrza
  tych dwóch hooków na `useQuery`** — komponentów nie trzeba dotykać.
- **Komponenty widoku nie importują fixtures.** Dane dostają przez propsy;
  jedynym wyjątkiem jest `portfolio-dashboard.tsx`, który woła hooki.

### Podgląd stanów przez URL

`?state=loading | empty | error | incomplete`

`incomplete` ustawia `complete=false` na snapshocie i `stale=true` na jednej
pozycji. Przy `?state=error` „Spróbuj ponownie” nadal zwraca błąd — stan jest
wymuszony URL-em, nie losowy.

## Paleta wykresów

`--chart-1…6`, `--chart-other`, `--chart-axis`, `--gain`, `--loss` w `src/index.css`,
osobno dla obu motywów. Szablonowe `--chart-*` z motywu `neutral` to odcienie
szarości — zostały nadpisane.

Paleta jest zwalidowana skryptem `validate_palette.js` ze skilla `dataviz`
(pasmo jasności, próg chromy, separacja przy protanopii i deuteranopii,
kontrast względem powierzchni karty: `#ffffff` i `#171717`). W jasnym motywie
akwa, żółty i magenta mają kontrast poniżej 3:1 — dlatego **każdy wycinek
donuta ma widoczną etykietę w liście obok** (nazwa, %, kwota). Nie wolno tej
listy usunąć bez ponownej walidacji palety.

Zasady:

- kolor jest przypisany na stałe **do nazwy źródła**, nigdy do pozycji w rankingu
  (`palette.ts`) — filtr ani zmiana kursu nie mogą przemalować wykresu,
- donut ma najwyżej 6 wycinków: przy większej liczbie źródeł pięć największych
  zostaje, reszta ląduje w „Inne” w neutralnej szarości,
- zysk/strata zawsze ze znakiem i strzałką — sam kolor nigdy nie niesie informacji,
- konfiguracja `ChartConfig` dla donuta nosi **tylko etykiety**; kolory idą wprost
  na `<Cell>`, bo shadcn zamienia klucze configu na nazwy zmiennych CSS,
  a nazwy źródeł mają spacje („TAO staking”) i powstałby niepoprawny arkusz stylów.

## Tryb prywatny

Kwoty **i ilości** zamieniane na `•••••`; procenty i kształt wykresu zostają,
oś Y się chowa. Maskowanie dzieje się na poziomie formatowania (`use-money.ts`),
nie CSS-em — w trybie prywatnym żadna kwota nie trafia do DOM, także do tooltipów.
Test `privacy.test.tsx` tego pilnuje.

## Konwencje

- **Bez `any`.** Nieznany kształt danych to `unknown` + zawężenie typu.
  Reguła `typescript/no-explicit-any` jest w `.oxlintrc.json` ustawiona na `error`.
- **Teksty UI po polsku** — nagłówki, etykiety, komunikaty błędów, `aria-label`.
- **Liczby i daty wyłącznie przez `Intl`** z locale `pl-PL`. Formatery trzymamy
  jako stałe modułu w `format.ts`, nie tworzymy ich w ciele komponentu.
  Uwaga przy testach: pl-PL grupuje dopiero od pięciu cyfr (`1240,18`, ale
  `48 210,55`), separatorem jest twarda spacja U+00A0, a Testing Library
  normalizuje ją do zwykłej.
- **Kwoty w `tabular-nums`** — utility `num` z `src/index.css`.
- **Komponenty shadcn modyfikujemy tylko przez motyw** — zmienne CSS w
  `src/index.css`. Plików w `src/components/ui/` nie edytujemy ręcznie
  (są w `.prettierignore`, żeby `shadcn add --overwrite` dawał czysty diff);
  nowe dodajemy przez `npx shadcn@latest add <nazwa>`.
- **Nigdy nie przełączamy się automatycznie na dane demo po błędzie API.**
  Błąd backendu pokazujemy jako błąd (komunikat + „Spróbuj ponownie”). Ciche
  podstawienie danych demo sprawiłoby, że użytkownik podejmuje decyzje finansowe
  na podstawie fikcyjnych liczb. Dane demo włącza tylko jawna flaga
  (`VITE_MOCK`, `?state=`), nigdy fallback.
- **Motyw**: klasa `.dark` na `<html>`, tryby `system` / `light` / `dark`,
  wybór w localStorage pod kluczem `tradeengine-theme`. Skrypt anty-FOUC w
  `index.html` powtarza tę logikę — przy zmianie klucza lub wartości trzeba
  zaktualizować oba miejsca.
- Dostęp do `localStorage` i `matchMedia` zawsze w `try/catch`
  (tryb prywatny przeglądarki, zablokowane dane witryny).
- **Animacje** wyłączone przy `prefers-reduced-motion` — globalnie w
  `src/index.css`, a dla wykresów przez `usePrefersReducedMotion`.
