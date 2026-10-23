import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'

import App from '@/App'
import { PrivacyProvider } from '@/components/privacy-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { createQueryClient } from '@/lib/query-client'

import './index.css'

const queryClient = createQueryClient()

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Nie znaleziono elementu #root w index.html.')
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PrivacyProvider>
          <TooltipProvider delayDuration={200}>
            <App />
          </TooltipProvider>
        </PrivacyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
