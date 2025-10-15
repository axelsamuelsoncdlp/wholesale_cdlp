import { NextRequest, NextResponse } from 'next/server'
import { getShopFromHost } from '@/lib/shopify'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Extract shop from host header (for embedded apps)
  const host = request.headers.get('host') || ''
  const shop = getShopFromHost(host)

  // For development, allow access without shop
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  // If no shop is detected, this might be a direct access
  // In production, you might want to redirect to a login page
  if (!shop) {
    return NextResponse.next()
  }

  // Add shop to headers for use in the app
  const response = NextResponse.next()
  response.headers.set('x-shop', shop)
  
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
