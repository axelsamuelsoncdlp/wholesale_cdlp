import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  const publicRoutes = [
    '/login',
    '/pending-approval',
    '/api/auth',
    '/api/profile',
    '/api/products',
    '/api/shop',
    '/api/logo',
    '/api/test-db',
    '/api/env-check',
    '/api/debug-shopify',
    '/auth/callback',
    '/_next',
    '/favicon.ico'
  ]

  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Create Supabase client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {
          // Will be handled by response
        },
        remove() {
          // Will be handled by response
        },
      },
    }
  )

  // Get session
  const { data: { session } } = await supabase.auth.getSession()

  // Check authentication for protected routes
  if (pathname.startsWith('/app') || pathname.startsWith('/api/')) {
    if (!session) {
      if (pathname.startsWith('/app')) {
        return NextResponse.redirect(new URL('/login', request.url))
      } else {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }
    
    // Let the application handle approval status checks
    // AuthContext will handle redirects based on profile status
    // Don't block here - this prevents middleware from interfering with navigation
  }

  // Add security headers
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.shopify.com",
    "style-src 'self' 'unsafe-inline' https://*.shopify.com",
    "img-src 'self' data: https: *.myshopify.com",
    "connect-src 'self' https://*.shopify.com https://*.supabase.co https://*.supabase.com",
    "frame-ancestors https://*.shopify.com https://admin.shopify.com",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: [
    '/app/:path*',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
