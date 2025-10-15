/**
 * Rate limiting implementation for enterprise security
 * Protects against abuse and ensures fair usage
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  windowMs: number
  max: number
  keyGenerator?: (request: Request) => string
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

// Default key generator
function defaultKeyGenerator(request: Request): string {
  const url = new URL(request.url)
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  // Include shop if available
  const shop = request.headers.get('x-shop')
  return shop ? `${shop}:${ip}:${url.pathname}` : `${ip}:${url.pathname}`
}

export function rateLimit(config: RateLimitConfig) {
  return (request: Request): RateLimitResult => {
    const key = config.keyGenerator 
      ? config.keyGenerator(request)
      : defaultKeyGenerator(request)
    
    const now = Date.now()
    // const windowStart = now - config.windowMs // For future use
    
    // Get current entry
    let entry = rateLimitStore.get(key)
    
    // Clean up old entries
    if (entry && entry.resetTime < now) {
      rateLimitStore.delete(key)
      entry = undefined
    }
    
    // Create new entry if needed
    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
      }
    }
    
    // Increment count
    entry.count++
    rateLimitStore.set(key, entry)
    
    // Check if limit exceeded
    const success = entry.count <= config.max
    const remaining = Math.max(0, config.max - entry.count)
    
    return {
      success,
      limit: config.max,
      remaining,
      reset: entry.resetTime,
    }
  }
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

// Predefined rate limiters for different endpoints
export const API_RATE_LIMITER = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
})

export const AUTH_RATE_LIMITER = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 auth attempts per minute
})

export const PRODUCT_RATE_LIMITER = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 product requests per minute
})

export const RENDER_RATE_LIMITER = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 PDF renders per minute
})
