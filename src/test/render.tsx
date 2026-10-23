import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'

import { PrivacyProvider } from '@/components/privacy-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { createQueryClient } from '@/lib/query-client'

/**
 * Ten sam zestaw providerów co w `main.tsx`, ale z własnym `QueryClient`
 * na każdy render — inaczej cache przeciekałby między testami.
 *
 * Testy chodzą z `VITE_MOCK=1` (`test.env` w `vite.config.ts`), więc hooki
 * danych nie wołają `fetch`; widok dostaje deterministyczne dane testowe.
 */
export function renderWithProviders(ui: ReactElement) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <ThemeProvider>
        <PrivacyProvider>
          <TooltipProvider>{ui}</TooltipProvider>
        </PrivacyProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  )
}
