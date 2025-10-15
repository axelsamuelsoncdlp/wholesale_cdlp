import { NextRequest, NextResponse } from 'next/server'
import { getShop, ShopifyClient } from '@/lib/shopify'
import { headers } from 'next/headers'
import { logSecurityEvent, sanitizeInput } from '@/lib/security'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  
  try {
    // Get shop from headers
    const headersList = await headers()
    const shop = headersList.get('x-shop')

    if (!shop) {
      logSecurityEvent({
        event: 'products_api_no_shop',
        ip,
        severity: 'medium',
      })

      return NextResponse.json(
        { error: 'Shop not found in headers' },
        { status: 400 }
      )
    }

    // Get shop data from database
    const shopData = await getShop(shop)
    if (!shopData) {
      logSecurityEvent({
        event: 'products_api_unauthenticated',
        shop,
        ip,
        severity: 'high',
      })

      return NextResponse.json(
        { error: 'Shop not authenticated' },
        { status: 401 }
      )
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
      details: { first, hasAfter: !!after },
    })

    // Create Shopify client and fetch products
    const client = new ShopifyClient(shop, shopData.accessToken)
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
