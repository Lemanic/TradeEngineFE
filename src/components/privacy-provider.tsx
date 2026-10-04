import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { PrivacyContext, readStoredPrivacy, writeStoredPrivacy } from '@/lib/privacy'

type PrivacyProviderProps = {
  children: ReactNode
  defaultPrivate?: boolean
}

export function PrivacyProvider({ children, defaultPrivate = false }: PrivacyProviderProps) {
  const [isPrivate, setPrivateState] = useState<boolean>(
    () => readStoredPrivacy() ?? defaultPrivate,
  )

  const setPrivate = useCallback((enabled: boolean) => {
    setPrivateState(enabled)
    writeStoredPrivacy(enabled)
  }, [])

  const toggle = useCallback(() => {
    setPrivateState((current) => {
      writeStoredPrivacy(!current)
      return !current
    })
  }, [])

  const value = useMemo(() => ({ isPrivate, setPrivate, toggle }), [isPrivate, setPrivate, toggle])

  return <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>
}
