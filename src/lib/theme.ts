import { createContext } from 'react'

export const THEME_STORAGE_KEY = 'tradeengine-theme'

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'

export type Theme = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export function isTheme(value: unknown): value is Theme {
  return value === 'system' || value === 'light' || value === 'dark'
}

/**
 * localStorage bywa niedostępny (tryb prywatny, zablokowane dane witryny),
 * a rzucony wyjątek wywaliłby cały render — stąd try/catch przy odczycie i zapisie.
 */
export function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(stored) ? stored : null
  } catch {
    return null
  }
}

export function writeStoredTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Motyw zadziała do końca sesji, po prostu się nie zapamięta.
  }
}

export function darkMediaQuery(): MediaQueryList | null {
  try {
    return window.matchMedia(DARK_MEDIA_QUERY)
  } catch {
    return null
  }
}

export function prefersDark(): boolean {
  return darkMediaQuery()?.matches ?? false
}

/** Klasa .dark na <html> — dokładnie to samo robi skrypt anty-FOUC w index.html. */
export function applyTheme(resolved: ResolvedTheme): void {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
