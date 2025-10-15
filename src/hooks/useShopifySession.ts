'use client'

import { useState, useEffect } from 'react'
import { createApp } from '@shopify/app-bridge'

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
    async function getSessionToken() {
      try {
        // Get host from URL parameters
        const host = new URLSearchParams(window.location.search).get("host")
        
        if (!host || !process.env.NEXT_PUBLIC_SHOPIFY_API_KEY) {
          setSessionData(prev => ({ ...prev, isLoading: false, error: 'App Bridge not initialized' }))
          return
        }

        // Create App Bridge instance
        const app = createApp({
          apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
          host: host,
        })

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
  }, [])

  return sessionData
}
