import { render } from '@testing-library/react'
import type { ReactElement } from 'react'

import { PrivacyProvider } from '@/components/privacy-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'

/** Ten sam zestaw providerów co w `main.tsx`. */
export function renderWithProviders(ui: ReactElement) {
  return render(
    <ThemeProvider>
      <PrivacyProvider>
        <TooltipProvider>{ui}</TooltipProvider>
      </PrivacyProvider>
    </ThemeProvider>,
  )
}
