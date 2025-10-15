import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, saveShop } from '@/lib/shopify'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shop = searchParams.get('shop')
  const code = searchParams.get('code')
  // const state = searchParams.get('state')
  // const hmac = searchParams.get('hmac')

  if (!shop || !code) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  try {
    // Exchange code for access token
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    const accessToken = await exchangeCodeForToken(shop, code, redirectUri)

    // Save shop and access token to database
    await saveShop(shop, accessToken)

    // Redirect to app
    return NextResponse.redirect(new URL('/app', request.url))
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.json(
      { error: 'Failed to complete OAuth flow' },
      { status: 500 }
    )
  }
}
