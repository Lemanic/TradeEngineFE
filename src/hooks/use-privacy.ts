import { useContext } from 'react'

import { PrivacyContext, type PrivacyContextValue } from '@/lib/privacy'

export function usePrivacy(): PrivacyContextValue {
  const context = useContext(PrivacyContext)
  if (!context) {
    throw new Error('usePrivacy musi być użyty wewnątrz <PrivacyProvider>.')
  }
  return context
}
