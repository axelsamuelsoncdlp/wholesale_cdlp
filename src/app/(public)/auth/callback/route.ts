import { NextRequest, NextResponse } from 'next/server'
import { verifyShopifyHmac, exchangeCodeForToken } from '@/lib/shopify'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shop = searchParams.get('shop')
  const code = searchParams.get('code')
  // const state = searchParams.get('state')
  // const hmac = searchParams.get('hmac')

  // Verify the request is from Shopify
  if (!verifyShopifyHmac(Object.fromEntries(searchParams))) {
    return NextResponse.json({ error: 'Invalid HMAC' }, { status: 400 })
  }

  if (!shop || !code) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  try {
    // Exchange code for access token
    const { accessToken } = await exchangeCodeForToken(shop, code)

    // Store shop and access token in database
    await db.shop.upsert({
      where: { domain: shop },
      update: {
        accessToken,
        updatedAt: new Date(),
      },
      create: {
        domain: shop,
        accessToken,
      },
    })

    // Redirect to the app with the shop parameter
    const appUrl = new URL('/app', request.url)
    appUrl.searchParams.set('shop', shop)
    appUrl.searchParams.set('host', searchParams.get('host') || '')

    return NextResponse.redirect(appUrl)
  } catch (error) {
    console.error('OAuth error:', error)
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 })
  }
}
