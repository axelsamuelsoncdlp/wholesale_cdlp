'use client'

import { useAuth } from '@/contexts/AuthContext'

export function createAuthenticatedFetch() {
  return async (url: string, options: RequestInit = {}) => {
    // Get session token from context
    const { token } = useAuth()
    
    if (!token) {
      throw new Error('No authentication token available')
    }

    // Add authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response
  }
}

// Hook for authenticated API calls
export function useAuthenticatedFetch() {
  const { token, isAuthenticated } = useAuth()

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    if (!isAuthenticated || !token) {
      throw new Error('User not authenticated')
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response
  }

  return { authenticatedFetch, isAuthenticated }
}
