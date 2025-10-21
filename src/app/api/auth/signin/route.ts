import { NextRequest, NextResponse } from 'next/server'

// Simple bypass for signin - always return success
export async function POST(request: NextRequest) {
  return NextResponse.json({
    url: '/app', // Redirect to main app
    ok: true
  })
}
