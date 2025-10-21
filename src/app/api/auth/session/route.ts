import { NextRequest, NextResponse } from 'next/server'

// Simple bypass authentication - just return a mock session
export async function GET(request: NextRequest) {
  return NextResponse.json({
    user: {
      id: 'admin-user',
      email: 'axel@cdlp.com',
      role: 'ADMIN',
      mfaEnabled: false,
      isActive: true
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    user: {
      id: 'admin-user',
      email: 'axel@cdlp.com',
      role: 'ADMIN',
      mfaEnabled: false,
      isActive: true
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  })
}
