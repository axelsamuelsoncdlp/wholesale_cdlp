import { NextRequest, NextResponse } from 'next/server'
import { getShopFromHost } from '@/lib/shopify'
import { SECURITY_HEADERS, logSecurityEvent, isAllowedIP } from '@/lib/security'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  // Log all requests for security monitoring
  logSecurityEvent({
    event: 'request_received',
    ip,
    userAgent: request.headers.get('user-agent') || undefined,
    severity: 'low',
    details: {
      pathname,
      method: request.method,
    },
  })

  // IP whitelist check for admin routes
  if (pathname.startsWith('/admin') && !isAllowedIP(ip)) {
    logSecurityEvent({
      event: 'admin_access_denied',
      ip,
      severity: 'high',
      details: { pathname },
    })

    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    )
  }

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.includes('.')
  ) {
    const response = NextResponse.next()
    
    // Add security headers to all responses
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  }

  // Extract shop from host header (for embedded apps)
  const host = request.headers.get('host') || ''
  const shop = getShopFromHost(host)

  // For development, allow access without shop
  if (process.env.NODE_ENV === 'development') {
    const response = NextResponse.next()
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  // If no shop is detected, this might be a direct access
  if (!shop) {
    logSecurityEvent({
      event: 'direct_access_attempt',
      ip,
      severity: 'medium',
      details: { pathname },
    })
    
    const response = NextResponse.next()
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  // Add shop to headers for use in the app
  const response = NextResponse.next()
  response.headers.set('x-shop', shop)
  
  // Add security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
