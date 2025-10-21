import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Simple environment check (safe values only)
  const envCheck = {
    hasApiKey: !!process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
    hasApiSecret: !!process.env.SHOPIFY_API_SECRET,
    hasAppUrl: !!process.env.APP_URL,
    hasPublicAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    hasScopes: !!process.env.SCOPES,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    // Show prefixes for verification (safe)
    apiKeyPrefix: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY?.substring(0, 8) + '...',
    appUrl: process.env.APP_URL,
    publicAppUrl: process.env.NEXT_PUBLIC_APP_URL,
    scopes: process.env.SCOPES,
  }

  return NextResponse.json(envCheck)
}
