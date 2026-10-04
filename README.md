# TradeEngine Dashboard

Frontend dashboardu portfela krypto dla bota TradeEngine: łączna wartość portfela,
historia, podział na źródła i tabela pozycji, w motywie jasnym i ciemnym.

Backend (Spring Boot) jest w osobnym repozytorium. Endpointy portfela powstaną
później — na razie dashboard działa na danych demo.

## Wymagania

- Node.js ≥ 22.12 (wersja z `.nvmrc`: 26.0.0 — `nvm use`)
- npm
- opcjonalnie backend TradeEngine na `http://localhost:8081` (dla proxy `/api`)

## Instalacja

```bash
npm install
cp .env.example .env   # opcjonalnie, gdy backend stoi pod innym adresem
```

Zmienne środowiskowe:

| Zmienna           | Domyślnie               | Znaczenie                                     |
| ----------------- | ----------------------- | --------------------------------------------- |
| `VITE_API_TARGET` | `http://localhost:8081` | cel proxy `/api` w trybie dev                 |
| `VITE_BASE`       | `/`                     | ścieżka bazowa builda (hosting w podkatalogu) |

## Uruchomienie

```bash
npm run dev        # http://localhost:5173
npm run dev:mock   # to samo z VITE_MOCK=1
```

Dashboard działa na danych testowych. Stany widoku można podejrzeć przez URL:

| URL                  | Co pokazuje                             |
| -------------------- | --------------------------------------- |
| `/?state=loading`    | szkielety ładowania                     |
| `/?state=error`      | błąd pobrania + „Spróbuj ponownie”      |
| `/?state=empty`      | brak snapshotów                         |
| `/?state=incomplete` | niepełny snapshot i nieaktualna pozycja |

## Pozostałe komendy

```bash
npm run build      # typecheck + build produkcyjny do dist/
npm run preview    # podgląd zbudowanej wersji
npm run lint       # oxlint
npm run format     # Prettier (z sortowaniem klas Tailwind)
npm run typecheck  # TypeScript
npm test           # Vitest
```

Konwencje i szczegóły techniczne: [CLAUDE.md](./CLAUDE.md).
