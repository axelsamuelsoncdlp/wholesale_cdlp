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
    const searchQuery = searchParams.get('search')
    const collection = searchParams.get('collection')
    const tag = searchParams.get('tag')
    
    const first = Math.min(parseInt(sanitizeInput(firstParam)), 100) // Max 100 products
    const after = afterParam ? sanitizeInput(afterParam) : undefined

    // Build Shopify search query string
    let shopifyQuery = ''
    const queryParts: string[] = []
    
    if (searchQuery) {
      const sanitized = sanitizeInput(searchQuery)
      queryParts.push(`title:*${sanitized}* OR tag:*${sanitized}* OR sku:*${sanitized}*`)
    }
    
    if (collection) {
      queryParts.push(`collection:${sanitizeInput(collection)}`)
    }
    
    if (tag) {
      queryParts.push(`tag:${sanitizeInput(tag)}`)
    }
    
    shopifyQuery = queryParts.join(' AND ')

    // Log product access
    logSecurityEvent({
      event: 'products_api_access',
      shop,
      ip,
      severity: 'low',
      details: { 
        first, 
        hasAfter: !!after, 
        hasSearch: !!searchQuery,
        hasCollection: !!collection,
        hasTag: !!tag,
        shopifyQuery,
        usingStaticToken: !!(await import('@/lib/shopify')).getStaticAccessToken() 
      },
    })

    // Fetch products - use search method if we have filters, otherwise use regular getProducts
    console.log('About to fetch products from Shopify...', { shopifyQuery, hasFilters: !!shopifyQuery })
    const products = shopifyQuery 
      ? await client.searchProducts(shopifyQuery, first, after)
      : await client.getProducts(first, after)
    console.log('Successfully fetched products:', { 
      productCount: products.edges.length,
      hasNextPage: products.pageInfo.hasNextPage 
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    })
    
    logSecurityEvent({
      event: 'products_api_error',
      ip,
      severity: 'high',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    })

    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
