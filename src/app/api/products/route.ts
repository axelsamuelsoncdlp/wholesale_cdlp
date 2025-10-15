import { NextRequest, NextResponse } from 'next/server'
import { getShop, ShopifyClient } from '@/lib/shopify'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get shop from headers
    const headersList = await headers()
    const shop = headersList.get('x-shop')

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found in headers' },
        { status: 400 }
      )
    }

    // Get shop data from database
    const shopData = await getShop(shop)
    if (!shopData) {
      return NextResponse.json(
        { error: 'Shop not authenticated' },
        { status: 401 }
      )
    }

    // Create Shopify client and fetch products
    const client = new ShopifyClient(shop, shopData.accessToken)
    const { searchParams } = new URL(request.url)
    const first = parseInt(searchParams.get('first') || '50')
    const after = searchParams.get('after') || undefined

    const products = await client.getProducts(first, after)

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
