'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useShopifySession } from '@/hooks/useShopifySession'

interface AuthContextType {
  shop: string | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useShopifySession()

  const value: AuthContextType = {
    ...session,
    isAuthenticated: Boolean(session.shop && session.token && !session.error)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
