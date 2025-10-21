import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get('error')
  
  // Log the error for debugging
  console.error('NextAuth error:', error)
  
  // Return a proper error response
  return NextResponse.json(
    { 
      error: error || 'Authentication error',
      message: 'An authentication error occurred'
    },
    { status: 400 }
  )
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
