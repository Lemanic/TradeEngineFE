import { createContext } from 'react'

export const PRIVACY_STORAGE_KEY = 'tradeengine-privacy'

/** localStorage bywa niedostępny — brak odczytu nie może wywalić renderu. */
export function readStoredPrivacy(): boolean | null {
  try {
    const stored = window.localStorage.getItem(PRIVACY_STORAGE_KEY)
    if (stored === '1') return true
    if (stored === '0') return false
    return null
  } catch {
    return null
  }
}

export function writeStoredPrivacy(enabled: boolean): void {
  try {
    window.localStorage.setItem(PRIVACY_STORAGE_KEY, enabled ? '1' : '0')
  } catch {
    // Ustawienie zadziała do końca sesji, po prostu się nie zapamięta.
  }
}

export type PrivacyContextValue = {
  /** `true` = kwoty zamienione na maskę. Procenty i kształt wykresu zostają. */
  isPrivate: boolean
  setPrivate: (enabled: boolean) => void
  toggle: () => void
}

export const PrivacyContext = createContext<PrivacyContextValue | null>(null)
