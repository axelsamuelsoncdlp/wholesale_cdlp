import { NextRequest, NextResponse } from 'next/server'

// Simple bypass for CSRF - always return success
export async function GET(request: NextRequest) {
  return NextResponse.json({
    csrfToken: 'bypass-token'
  })
}
