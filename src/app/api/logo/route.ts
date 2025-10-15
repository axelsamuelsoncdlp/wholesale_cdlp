import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { logoUrl, shop } = await request.json()

    if (!logoUrl || !shop) {
      return NextResponse.json({ error: 'Logo URL and shop are required' }, { status: 400 })
    }

    // Update shop with logo URL
    await db.shop.upsert({
      where: { domain: shop },
      update: { logoUrl },
      create: {
        id: shop,
        domain: shop,
        logoUrl,
        accessToken: '', // Will be set when OAuth is implemented
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving logo:', error)
    return NextResponse.json({ error: 'Failed to save logo' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shop = searchParams.get('shop')

    if (!shop) {
      return NextResponse.json({ error: 'Shop is required' }, { status: 400 })
    }

    const shopData = await db.shop.findUnique({
      where: { domain: shop },
      select: { logoUrl: true },
    })

    return NextResponse.json({ logoUrl: shopData?.logoUrl || null })
  } catch (error) {
    console.error('Error fetching logo:', error)
    return NextResponse.json({ error: 'Failed to fetch logo' }, { status: 500 })
  }
}
