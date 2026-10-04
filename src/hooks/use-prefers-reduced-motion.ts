import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function query(): MediaQueryList | null {
  try {
    return window.matchMedia(QUERY)
  } catch {
    return null
  }
}

/** Animacje wykresów są dekoracją — przy tym ustawieniu je wyłączamy. */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => query()?.matches ?? false)

  useEffect(() => {
    const media = query()
    if (!media) return

    const handleChange = (event: MediaQueryListEvent) => setPrefersReduced(event.matches)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  return prefersReduced
}
