import { useContext } from 'react'

import { ThemeContext, type ThemeContextValue } from '@/lib/theme'

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme musi być użyty wewnątrz <ThemeProvider>.')
  }
  return context
}
