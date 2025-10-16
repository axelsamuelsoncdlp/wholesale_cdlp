import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('[Test DB] Testing database connection...')
    
    // Test basic database connection
    const shops = await db.shop.findMany({
      select: {
        id: true,
        domain: true,
        logoUrl: true,
        createdAt: true
      },
      take: 5
    })
    
    console.log('[Test DB] Found shops:', shops.length)
    
    // Test creating a shop if it doesn't exist
    const testShop = await db.shop.upsert({
      where: { domain: 'cdlpstore' },
      update: {},
      create: {
        id: 'cdlpstore',
        domain: 'cdlpstore',
        accessToken: 'test-token',
        logoUrl: null
      }
    })
    
    console.log('[Test DB] Test shop created/updated:', testShop)
    
    return NextResponse.json({
      success: true,
      shopsCount: shops.length,
      testShop: testShop,
      message: 'Database connection working'
    })
    
  } catch (error) {
    console.error('[Test DB] Database error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
