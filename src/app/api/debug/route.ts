import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Only allow in development or with specific debug parameter
  const isDevelopment = process.env.NODE_ENV === 'development'
  const debugKey = request.nextUrl.searchParams.get('key')
  
  if (!isDevelopment && debugKey !== 'cdlp-debug-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check environment variables (without exposing sensitive values)
  const envCheck = {
    hasApiKey: !!process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
    hasApiSecret: !!process.env.SHOPIFY_API_SECRET,
    hasAccessToken: !!process.env.SHOPIFY_ACCESS_TOKEN,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    shopifyApiVersion: process.env.SHOPIFY_API_VERSION || '2024-10',
    // Show first few characters for verification
    apiKeyPrefix: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY?.substring(0, 8) + '...',
    accessTokenPrefix: process.env.SHOPIFY_ACCESS_TOKEN?.substring(0, 8) + '...',
  }

  return NextResponse.json(envCheck)
}
