import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/App'
import { PrivacyProvider } from '@/components/privacy-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'

import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Nie znaleziono elementu #root w index.html.')
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <PrivacyProvider>
        <TooltipProvider delayDuration={200}>
          <App />
        </TooltipProvider>
      </PrivacyProvider>
    </ThemeProvider>
  </StrictMode>,
)
