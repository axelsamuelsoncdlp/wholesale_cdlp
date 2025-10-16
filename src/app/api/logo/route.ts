import { NextRequest, NextResponse } from 'next/server'
import { saveLogo, getLogo } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { logoUrl, shop } = await request.json()
    
    console.log('[Logo API] POST request received:', { 
      shop, 
      hasLogoUrl: !!logoUrl,
      logoUrlLength: logoUrl?.length 
    })

    if (!shop) {
      return NextResponse.json({ error: 'Shop is required' }, { status: 400 })
    }

    // Save logo using Supabase
    const result = await saveLogo(shop, logoUrl || '')
    
    if (!result.success) {
      console.error('[Logo API] Failed to save logo:', result.error)
      return NextResponse.json({ 
        error: 'Failed to save logo', 
        details: result.error 
      }, { status: 500 })
    }
    
    console.log('[Logo API] Logo saved successfully:', { 
      shop, 
      hasLogoUrl: !!logoUrl 
    })

    return NextResponse.json({ success: true, logoUrl })
  } catch (error) {
    console.error('[Logo API] Error saving logo:', error)
    return NextResponse.json({ 
      error: 'Failed to save logo', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shop = searchParams.get('shop')
    
    console.log('[Logo API] GET request received:', { shop })

    if (!shop) {
      return NextResponse.json({ error: 'Shop is required' }, { status: 400 })
    }

    // Get logo using Supabase
    const result = await getLogo(shop)
    
    if (!result.success) {
      console.error('[Logo API] Failed to fetch logo:', result.error)
      return NextResponse.json({ 
        error: 'Failed to fetch logo',
        details: result.error
      }, { status: 500 })
    }
    
    console.log('[Logo API] Logo fetched:', { 
      shop, 
      hasLogoUrl: !!result.logoUrl,
      logoUrlLength: result.logoUrl?.length 
    })

    return NextResponse.json({ logoUrl: result.logoUrl })
  } catch (error) {
    console.error('[Logo API] Error fetching logo:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch logo',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
