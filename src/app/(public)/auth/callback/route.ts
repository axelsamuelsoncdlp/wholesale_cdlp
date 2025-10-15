import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, saveShop } from '@/lib/shopify'
import { verifyShopifyHmac, sanitizeShopDomain, logSecurityEvent } from '@/lib/security'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shop = searchParams.get('shop')
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const hmac = searchParams.get('hmac')

  // Log security event
  logSecurityEvent({
    event: 'oauth_callback_attempt',
    shop: shop || undefined,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
    severity: 'medium',
    details: {
      hasCode: !!code,
      hasHmac: !!hmac,
      hasState: !!state,
    },
  })

  // Validate HMAC for security
  if (!verifyShopifyHmac(Object.fromEntries(searchParams))) {
    logSecurityEvent({
      event: 'oauth_callback_invalid_hmac',
      shop: shop || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      severity: 'high',
    })

    return NextResponse.json(
      { error: 'Invalid HMAC signature' },
      { status: 400 }
    )
  }

  if (!shop || !code) {
    logSecurityEvent({
      event: 'oauth_callback_missing_params',
      shop: shop || undefined,
      severity: 'medium',
    })

    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  // Sanitize and validate shop domain
  const cleanShop = sanitizeShopDomain(shop)
  if (!cleanShop) {
    logSecurityEvent({
      event: 'oauth_callback_invalid_shop',
      shop,
      severity: 'high',
    })

    return NextResponse.json(
      { error: 'Invalid shop domain' },
      { status: 400 }
    )
  }

  try {
    // Exchange code for access token
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    const accessToken = await exchangeCodeForToken(cleanShop, code, redirectUri)

    // Save shop and access token to database
    await saveShop(cleanShop, accessToken)

    logSecurityEvent({
      event: 'oauth_callback_success',
      shop: cleanShop,
      severity: 'low',
    })

    // Redirect to app
    return NextResponse.redirect(new URL('/app', request.url))
  } catch (error) {
    console.error('OAuth callback error:', error)
    
    logSecurityEvent({
      event: 'oauth_callback_error',
      shop: cleanShop,
      severity: 'high',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    })

    return NextResponse.json(
      { error: 'Failed to complete OAuth flow' },
      { status: 500 }
    )
  }
}
