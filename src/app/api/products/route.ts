import { NextRequest, NextResponse } from 'next/server'
import { getShop, ShopifyClient, createStaticShopifyClient } from '@/lib/shopify'
import { logSecurityEvent, sanitizeInput } from '@/lib/security'
// import { checkAuthentication } from '@/lib/auth' // Temporarily disabled

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  
  try {
    // Temporarily disabled authentication for testing
    const shop = 'cdlpstore' // Hardcoded for testing

    console.log('Products API called:', { shop, ip })
    console.log('Environment check:', {
      hasApiKey: !!process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
      hasApiSecret: !!process.env.SHOPIFY_API_SECRET,
      hasAccessToken: !!process.env.SHOPIFY_ACCESS_TOKEN,
    })

    // Try static token first (Custom App)
    let client = createStaticShopifyClient(shop)
    
    if (!client) {
      console.log('No static client, trying database token...')
      const shopData = await getShop(shop)
      if (!shopData) {
        console.log('No shop data found in database')
        logSecurityEvent({
          event: 'products_api_shop_not_found',
          shop,
          ip,
          severity: 'high',
        })

        return NextResponse.json(
          { error: 'Shop data not found and no static token available' },
          { status: 404 }
        )
      }
      client = new ShopifyClient(shop, shopData.accessToken)
      console.log('Created client from database token')
    } else {
      console.log('Created client from static token')
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
