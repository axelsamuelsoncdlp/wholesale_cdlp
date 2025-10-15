'use client'

import { useState, useEffect } from 'react'
import { useAppBridge } from '@shopify/app-bridge-react'

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

  const app = useAppBridge()

  useEffect(() => {
    async function getSessionToken() {
      try {
        if (!app) {
          setSessionData(prev => ({ ...prev, isLoading: false, error: 'App Bridge not initialized' }))
          return
        }

        // Get session token from App Bridge
        const sessionToken = await app.getSessionToken()
        
        // Verify the token with our backend
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Invalid session token')
        }

        const data = await response.json()
        
        setSessionData({
          shop: data.shop,
          token: sessionToken,
          isLoading: false,
          error: null
        })
      } catch (error) {
        console.error('Session error:', error)
        setSessionData({
          shop: null,
          token: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    getSessionToken()
  }, [app])

  return sessionData
}
