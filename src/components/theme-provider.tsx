import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  applyTheme,
  darkMediaQuery,
  prefersDark,
  readStoredTheme,
  ThemeContext,
  writeStoredTheme,
  type ResolvedTheme,
  type Theme,
} from '@/lib/theme'

type ThemeProviderProps = {
  children: ReactNode
  defaultTheme?: Theme
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme() ?? defaultTheme)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() =>
    prefersDark() ? 'dark' : 'light',
  )

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  // W trybie systemowym motyw musi nadążać za zmianą ustawień OS bez odświeżania strony.
  useEffect(() => {
    const media = darkMediaQuery()
    if (!media) return

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    writeStoredTheme(next)
  }, [])

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
