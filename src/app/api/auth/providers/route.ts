import { NextRequest, NextResponse } from 'next/server'

// Simple bypass for providers - return empty array
export async function GET(request: NextRequest) {
  return NextResponse.json([])
}
