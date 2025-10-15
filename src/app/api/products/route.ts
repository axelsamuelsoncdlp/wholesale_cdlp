import { NextRequest, NextResponse } from 'next/server'
import { getShop, ShopifyClient, createStaticShopifyClient } from '@/lib/shopify'
import { logSecurityEvent, sanitizeInput } from '@/lib/security'
import { checkAuthentication } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  
  try {
    // Check authentication first
    const authResult = await checkAuthentication()
    
    if (!authResult.isAuthenticated) {
      logSecurityEvent({
        event: 'products_api_unauthenticated_access',
        ip,
        severity: 'high',
        details: { error: authResult.error },
      })

      return NextResponse.json(
        { error: authResult.error || 'Authentication required' },
        { status: 401 }
      )
    }

    const shop = authResult.shop!

    // Try static token first (Custom App)
    let client = createStaticShopifyClient(shop)
    
    // Fallback to database token (OAuth app)
    if (!client) {
      const shopData = await getShop(shop)
      if (!shopData) {
        logSecurityEvent({
          event: 'products_api_shop_not_found',
          shop,
          ip,
          severity: 'high',
        })

        return NextResponse.json(
          { error: 'Shop data not found' },
          { status: 404 }
        )
      }
      client = new ShopifyClient(shop, shopData.accessToken)
    }

    // Validate and sanitize input parameters
    const { searchParams } = new URL(request.url)
    const firstParam = searchParams.get('first') || '50'
    const afterParam = searchParams.get('after')
    
    const first = Math.min(parseInt(sanitizeInput(firstParam)), 100) // Max 100 products
    const after = afterParam ? sanitizeInput(afterParam) : undefined

    // Log product access
    logSecurityEvent({
      event: 'products_api_access',
      shop,
      ip,
      severity: 'low',
      details: { first, hasAfter: !!after, usingStaticToken: !!(await import('@/lib/shopify')).getStaticAccessToken() },
    })

    // Fetch products
    const products = await client.getProducts(first, after)

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    
    logSecurityEvent({
      event: 'products_api_error',
      ip,
      severity: 'high',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    })

    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
