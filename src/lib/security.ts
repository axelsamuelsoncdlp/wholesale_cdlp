// Simple security utilities for CDLP Linesheet Generator
// This is a minimal version to replace the removed security.ts

import crypto from 'crypto'

// HMAC validation for Shopify requests
export function verifyShopifyHmac(query: Record<string, string | null>): boolean {
  const hmac = query.hmac
  const shop = query.shop
  
  if (!hmac || !shop) {
    return false
  }

  // Remove hmac and signature from query for validation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hmac: _hmac, signature: _signature, ...params } = query
  
  // Sort parameters and create query string
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')

  // Create HMAC
  const secret = process.env.SHOPIFY_API_SECRET!
  const calculatedHmac = crypto
    .createHmac('sha256', secret)
    .update(sortedParams)
    .digest('hex')

  // Compare HMACs using timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(hmac, 'hex'),
    Buffer.from(calculatedHmac, 'hex')
  )
}

// Validate shop domain format
export function validateShopDomain(shop: string): boolean {
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/
  return shopRegex.test(shop) && shop.length >= 3 && shop.length <= 63
}

// Sanitize shop domain
export function sanitizeShopDomain(shop: string): string | null {
  if (!shop) return null
  
  // Remove .myshopify.com if present
  const cleanShop = shop.toLowerCase().replace('.myshopify.com', '')
  
  // Validate format
  if (!validateShopDomain(cleanShop)) {
    return null
  }
  
  return cleanShop
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

// Simple logging function
export function logSecurityEvent(event: Record<string, unknown>): void {
  console.log('[SECURITY EVENT]', event)
}
