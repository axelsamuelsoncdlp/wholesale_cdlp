/**
 * Authentication utilities for CDLP Linesheet Generator
 * Ensures only authenticated Shopify stores can access the app
 */

import { getShop, getStaticAccessToken } from './shopify'
import { logSecurityEvent } from './security'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export interface AuthResult {
  isAuthenticated: boolean
  shop?: string
  error?: string
}

/**
 * Check if the current request is from an authenticated Shopify store
 */
export async function checkAuthentication(): Promise<AuthResult> {
  try {
    const headersList = await headers()
    const shop = headersList.get('x-shop')
    const userAgent = headersList.get('user-agent')
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip')

    // In development mode, allow access for testing
    if (process.env.NODE_ENV === 'development') {
      return {
        isAuthenticated: true,
        shop: shop || 'development-store',
      }
    }

    // No shop detected
    if (!shop) {
      logSecurityEvent({
        event: 'unauthenticated_access_attempt',
        ip: ip || undefined,
        userAgent: userAgent || undefined,
        severity: 'medium',
      })

      return {
        isAuthenticated: false,
        error: 'No shop detected. This app must be accessed through Shopify Admin.',
      }
    }

    // Check if we have a static access token (Custom App)
    const staticToken = getStaticAccessToken()
    if (staticToken) {
      // Using static token - no database check needed
      logSecurityEvent({
        event: 'static_token_authentication',
        shop,
        ip: ip || undefined,
        userAgent: userAgent || undefined,
        severity: 'low',
      })

      return {
        isAuthenticated: true,
        shop,
      }
    }

    // Fallback to database check for OAuth apps
    const shopData = await getShop(shop)
    if (!shopData) {
      logSecurityEvent({
        event: 'unauthenticated_shop_access',
        shop,
        ip: ip || undefined,
        userAgent: userAgent || undefined,
        severity: 'high',
      })

      return {
        isAuthenticated: false,
        shop,
        error: 'Shop not authenticated. Please reinstall the app.',
      }
    }

    // Check if access token is still valid (basic check)
    if (!shopData.accessToken || shopData.accessToken.length < 10) {
      logSecurityEvent({
        event: 'invalid_access_token',
        shop,
        ip: ip || undefined,
        userAgent: userAgent || undefined,
        severity: 'high',
      })

      return {
        isAuthenticated: false,
        shop,
        error: 'Invalid access token. Please reinstall the app.',
      }
    }

    return {
      isAuthenticated: true,
      shop,
    }
  } catch (error) {
    console.error('Authentication check error:', error)
    
    logSecurityEvent({
      event: 'authentication_check_error',
      severity: 'high',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    })

    return {
      isAuthenticated: false,
      error: 'Authentication check failed.',
    }
  }
}

/**
 * Require authentication for a page/component
 * Redirects to login if not authenticated
 */
export async function requireAuth(): Promise<{ shop: string }> {
  const authResult = await checkAuthentication()
  
  if (!authResult.isAuthenticated) {
    // In production, redirect to Shopify app installation
    if (process.env.NODE_ENV === 'production') {
      redirect('/auth/login')
    }
    
    // In development, allow access but show warning
    return { shop: 'development-store' }
  }

  return { shop: authResult.shop! }
}

/**
 * Check if user is accessing from Shopify Admin (embedded app)
 */
export function isEmbeddedApp(): boolean {
  // This would typically check for Shopify-specific headers
  // For now, we assume it's embedded if we have a shop
  return true
}

/**
 * Generate Shopify app installation URL (for Custom App)
 */
export function getShopifyInstallUrl(shop: string): string {
  const clientId = process.env.SHOPIFY_API_KEY!
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
  const scopes = 'read_products,read_product_listings'
  
  const params = new URLSearchParams({
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
  })

  return `https://${shop}.myshopify.com/admin/oauth/authorize?${params.toString()}`
}

/**
 * CDLP Store Configuration
 */
export const CDLP_STORE_CONFIG = {
  name: 'CDLP Store',
  domain: 'cdlpstore',
  fullDomain: 'cdlpstore.myshopify.com',
  description: 'Official CDLP wholesale linesheet generator',
} as const

/**
 * Get CDLP store authentication URL
 */
export function getCDLPStoreAuthUrl(): string {
  return getShopifyInstallUrl(CDLP_STORE_CONFIG.domain)
}

/**
 * Check if shop is CDLP store
 */
export function isCDLPStore(shop: string): boolean {
  return shop === CDLP_STORE_CONFIG.domain || shop === CDLP_STORE_CONFIG.fullDomain
}
