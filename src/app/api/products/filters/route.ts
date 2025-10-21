import { NextRequest, NextResponse } from 'next/server'
import { getShop, ShopifyClient, createStaticShopifyClient } from '@/lib/shopify'
import { logSecurityEvent } from '@/lib/security'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  
  try {
    const shop = 'cdlpstore' // Hardcoded for testing

    console.log('Filters API called:', { shop, ip })

    // Try static token first (Custom App)
    let client = createStaticShopifyClient(shop)
    
    if (!client) {
      console.log('No static client, trying database token...')
      const shopData = await getShop(shop)
      if (!shopData) {
        console.log('No shop data found in database')
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

    // Fetch all products to extract unique collections and tags
    const collections = new Set<string>()
    const tags = new Set<string>()
    
    let hasNextPage = true
    let endCursor: string | null = null
    let totalProducts = 0

    console.log('Fetching all products to extract collections and tags...')

    while (hasNextPage && totalProducts < 1000) { // Limit to prevent excessive API calls
      const products = await client.getProducts(100, endCursor || undefined)
      
      products.edges.forEach(edge => {
        const product = edge.node
        
        // Extract collections
        if (product.collections?.edges) {
          product.collections.edges.forEach(collectionEdge => {
            collections.add(collectionEdge.node.title)
          })
        }
        
        // Extract tags
        if (product.tags) {
          product.tags.forEach(tag => {
            if (tag.trim()) {
              tags.add(tag.trim())
            }
          })
        }
      })
      
      hasNextPage = products.pageInfo.hasNextPage
      endCursor = products.pageInfo.endCursor
      totalProducts += products.edges.length
      
      console.log(`Fetched ${products.edges.length} products, total: ${totalProducts}`)
    }

    console.log('Extracted filters:', { 
      collectionsCount: collections.size, 
      tagsCount: tags.size,
      totalProducts 
    })

    // Log filter access
    logSecurityEvent({
      event: 'filters_api_access',
      shop,
      ip,
      severity: 'low',
      details: { 
        totalProducts,
        collectionsCount: collections.size,
        tagsCount: tags.size,
        usingStaticToken: !!(await import('@/lib/shopify')).getStaticAccessToken() 
      },
    })

    return NextResponse.json({
      collections: Array.from(collections).sort(),
      tags: Array.from(tags).sort(),
      totalProducts
    })

  } catch (error) {
    console.error('Error fetching filters:', error)
    logSecurityEvent({
      event: 'filters_api_error',
      shop: 'cdlpstore',
      ip,
      severity: 'medium',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    })

    return NextResponse.json(
      { 
        error: 'Failed to fetch filters',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
