import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { logSecurityEvent } from '@/lib/security'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  // Allow public routes
  const publicRoutes = [
    '/login',
    '/register',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
    '/setup-mfa',
    '/api/auth',
    '/_next',
    '/favicon.ico'
  ]

  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get JWT token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  // Check authentication for protected routes
  if (pathname.startsWith('/app') || pathname.startsWith('/api/')) {
    if (!token) {
      logSecurityEvent({
        event: 'unauthorized_access_attempt',
        severity: 'medium',
        details: {
          path: pathname,
          ip,
          userAgent
        }
      })

      if (pathname.startsWith('/app')) {
        return NextResponse.redirect(new URL('/login', request.url))
      } else {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    // Check if user is active (approved)
    if (!token.isActive) {
      logSecurityEvent({
        event: 'inactive_user_access_attempt',
        userId: token.sub,
        severity: 'medium',
        details: {
          path: pathname,
          ip,
          userAgent
        }
      })

      if (pathname.startsWith('/app')) {
        return NextResponse.redirect(new URL('/login?error=pending_approval', request.url))
      } else {
        return NextResponse.json(
          { error: 'Account pending approval' },
          { status: 403 }
        )
      }
    }

    // Check MFA for sensitive routes
    const mfaRequiredRoutes = ['/app', '/api/render', '/api/products']
    const requiresMFA = mfaRequiredRoutes.some(route => pathname.startsWith(route))

    if (requiresMFA && !token.mfaEnabled) {
      logSecurityEvent({
        event: 'mfa_required_access_attempt',
        userId: token.sub,
        severity: 'medium',
        details: {
          path: pathname,
          ip,
          userAgent
        }
      })

      if (pathname.startsWith('/app')) {
        return NextResponse.redirect(new URL('/setup-mfa', request.url))
      } else {
        return NextResponse.json(
          { error: 'MFA setup required' },
          { status: 403 }
        )
      }
    }

    // Admin-only routes
    const adminRoutes = ['/app/admin']
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

    if (isAdminRoute && token.role !== 'ADMIN') {
      logSecurityEvent({
        event: 'admin_access_denied',
        userId: token.sub,
        severity: 'high',
        details: {
          path: pathname,
          ip,
          userAgent,
          userRole: token.role
        }
      })

      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
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
    "connect-src 'self' https://*.shopify.com",
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
