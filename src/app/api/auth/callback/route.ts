import { NextRequest, NextResponse } from 'next/server'

// Simple bypass for callback - always return success
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/app', request.url))
}

export async function POST(request: NextRequest) {
  return NextResponse.redirect(new URL('/app', request.url))
}
