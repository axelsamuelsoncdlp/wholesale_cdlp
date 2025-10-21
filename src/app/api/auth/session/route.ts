import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config-simple'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Session endpoint called, session:', session)
    
    // Always return valid JSON, even if session is null
    return NextResponse.json(session || null)
  } catch (error) {
    console.error('Session endpoint error:', error)
    
    // Return null instead of error
    return NextResponse.json(null)
  }
}

