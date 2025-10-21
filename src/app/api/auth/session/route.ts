import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Log for debugging
    console.log('Session endpoint called, session:', session)
    
    return NextResponse.json(session || {})
  } catch (error) {
    console.error('Session endpoint error:', error)
    
    // Return empty session object instead of error
    return NextResponse.json({})
  }
}

