'use client'

import { useState, useEffect } from 'react'

interface SessionData {
  shop: string | null
  token: string | null
  isLoading: boolean
  error: string | null
}

export function useShopifySession(): SessionData {
  const [sessionData, setSessionData] = useState<SessionData>({
    shop: null,
    token: null,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    // Temporarily disabled authentication for testing
    // Simulate successful session for testing purposes
    setTimeout(() => {
      setSessionData({
        shop: 'cdlpstore', // Hardcoded for testing
        token: 'mock-token', // Mock token for testing
        isLoading: false,
        error: null
      })
    }, 500) // Small delay to simulate loading
  }, [])

  return sessionData
}
