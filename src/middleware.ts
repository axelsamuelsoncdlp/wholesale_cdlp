import { NextRequest, NextResponse } from 'next/server'

// Temporarily disabled authentication for testing
export async function middleware(request: NextRequest) {
  // Allow all requests to pass through without authentication
  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/api/secure/:path*'],
};
