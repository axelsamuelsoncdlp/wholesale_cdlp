import { NextRequest, NextResponse } from 'next/server'
import { getCDLPStoreAuthUrl } from '@/lib/auth'
import { logSecurityEvent } from '@/lib/security'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || undefined

  // Log CDLP store access attempt
  logSecurityEvent({
    event: 'cdlp_store_access_attempt',
    shop: 'cdlpstore',
    ip,
    userAgent,
    severity: 'low',
  })

  try {
    // Generate Shopify OAuth URL for CDLP store
    const shopifyInstallUrl = getCDLPStoreAuthUrl()
    
    // Redirect to Shopify OAuth
    return NextResponse.redirect(shopifyInstallUrl)
  } catch (error) {
    console.error('CDLP store access error:', error)
    
    logSecurityEvent({
      event: 'cdlp_store_access_error',
      shop: 'cdlpstore',
      ip,
      userAgent,
      severity: 'high',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    })

    return NextResponse.json(
      { error: 'Failed to initiate CDLP store authentication' },
      { status: 500 }
    )
  }
}
