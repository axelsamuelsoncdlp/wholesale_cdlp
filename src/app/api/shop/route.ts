import { NextRequest, NextResponse } from 'next/server'
import { getShop, ShopifyClient, createStaticShopifyClient } from '@/lib/shopify'
import { logSecurityEvent } from '@/lib/security'
import { checkAuthentication } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  
  try {
    // Check authentication
    const authResult = await checkAuthentication()
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shop = authResult.shop

    // Log the request
    logSecurityEvent({
      event: 'shop_data_request',
      shop,
      ip,
      severity: 'low'
    })

    // Check if shop is authenticated
    let shopData = null

    if (shop && shop !== 'development-store') {
      try {
        // Try static token first (Custom App)
        let client = createStaticShopifyClient(shop)
        
        if (!client) {
          // Fallback to database token (OAuth app)
          const shopRecord = await getShop(shop)
          if (shopRecord) {
            client = new ShopifyClient(shop, shopRecord.accessToken)
          }
        }
        
        if (client) {
          // Fetch shop data
          const shopQuery = `
            query {
              shop {
                name
                email
                domain
                myshopifyDomain
                plan {
                  displayName
                }
                currencyCode
                timezone
              }
            }
          `
          const response = await client.query(shopQuery)
          shopData = response.data.shop
        }
      } catch (error) {
        console.error('Error fetching shop data:', error)
        logSecurityEvent({
          event: 'shop_data_error',
          shop,
          ip,
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
          severity: 'medium'
        })
      }
    }

    return NextResponse.json(shopData)
  } catch (error) {
    console.error('Shop API error:', error)
    logSecurityEvent({
      event: 'shop_api_error',
      ip,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      severity: 'high'
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
