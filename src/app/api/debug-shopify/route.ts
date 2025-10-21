import { NextRequest, NextResponse } from 'next/server'
import { createStaticShopifyClient, getStaticAccessToken } from '@/lib/shopify'

export async function GET(_request: NextRequest) {
  try {
    const shop = 'cdlpstore'
    
    // Check environment variables
    const accessToken = getStaticAccessToken()
    const hasAccessToken = !!accessToken
    const tokenPrefix = accessToken?.substring(0, 8) + '...' || 'none'
    
    // Try to create client
    const client = createStaticShopifyClient(shop)
    const hasClient = !!client
    
    // Try a simple Shopify API call
    let apiTest = null
    if (client) {
      try {
        // Test with a simple shop query
        const testQuery = `
          query {
            shop {
              name
              domain
            }
          }
        `
        
        const response = await fetch(`https://${shop}.myshopify.com/admin/api/2024-10/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken!,
          },
          body: JSON.stringify({ query: testQuery }),
        })
        
        if (response.ok) {
          const data = await response.json()
          apiTest = { success: true, shopName: data.data?.shop?.name }
        } else {
          apiTest = { 
            success: false, 
            status: response.status, 
            statusText: response.statusText,
            error: await response.text()
          }
        }
      } catch (error) {
        apiTest = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
    
    return NextResponse.json({
      shop,
      hasAccessToken,
      tokenPrefix,
      hasClient,
      apiTest,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasApiKey: !!process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
        hasApiSecret: !!process.env.SHOPIFY_API_SECRET,
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
