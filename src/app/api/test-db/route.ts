import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('[Test DB] Testing Supabase connection...')
    console.log('[Test DB] Environment check:', {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseApiKey: !!process.env.SUPABASE_API_KEY,
      supabaseUrlStart: process.env.SUPABASE_URL?.substring(0, 20)
    })
    
    // Test Supabase connection by querying shops table
    const { data: shops, error: shopsError } = await supabase
      .from('shops')
      .select('id, domain, logo_url, created_at')
      .limit(5)
    
    if (shopsError) {
      console.error('[Test DB] Error querying shops:', shopsError)
      return NextResponse.json({
        success: false,
        error: `Supabase error: ${shopsError.message}`,
        code: shopsError.code,
        env: {
          hasSupabaseUrl: !!process.env.SUPABASE_URL,
          hasSupabaseApiKey: !!process.env.SUPABASE_API_KEY,
          supabaseUrlStart: process.env.SUPABASE_URL?.substring(0, 20)
        }
      }, { status: 500 })
    }
    
    console.log('[Test DB] Found shops:', shops?.length || 0)
    
    // Test creating a shop if it doesn't exist
    const { data: testShop, error: upsertError } = await supabase
      .from('shops')
      .upsert({
        id: 'cdlpstore',
        domain: 'cdlpstore',
        access_token: 'test-token',
        logo_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (upsertError) {
      console.error('[Test DB] Error creating test shop:', upsertError)
      return NextResponse.json({
        success: false,
        error: `Supabase upsert error: ${upsertError.message}`,
        code: upsertError.code,
        env: {
          hasSupabaseUrl: !!process.env.SUPABASE_URL,
          hasSupabaseApiKey: !!process.env.SUPABASE_API_KEY
        }
      }, { status: 500 })
    }
    
    console.log('[Test DB] Test shop created/updated:', testShop)
    
    return NextResponse.json({
      success: true,
      shopsCount: shops?.length || 0,
      testShop: testShop?.[0],
      message: 'Supabase connection working',
      env: {
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseApiKey: !!process.env.SUPABASE_API_KEY
      }
    })
    
  } catch (error) {
    console.error('[Test DB] Connection error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseApiKey: !!process.env.SUPABASE_API_KEY,
        supabaseUrlStart: process.env.SUPABASE_URL?.substring(0, 20)
      }
    }, { status: 500 })
  }
}
