import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;
const APP_URL = process.env.APP_URL!;

const protectedPaths = ['/app'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/auth') ||
    pathname === '/' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if path requires authentication
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Check for session token in Authorization header
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    // No token - redirect to auth
    const shop = request.nextUrl.searchParams.get("shop") || "";
    return NextResponse.redirect(`${APP_URL}/auth?shop=${shop}`);
  }

  try {
    // Verify session token
    await jwtVerify(token, new TextEncoder().encode(SHOPIFY_API_SECRET));
    return NextResponse.next();
  } catch (e) {
    // Invalid token - redirect to auth
    const shop = request.nextUrl.searchParams.get("shop") || "";
    return NextResponse.redirect(`${APP_URL}/auth?shop=${shop}`);
  }
}

export const config = {
  matcher: ['/app/:path*', '/api/secure/:path*'],
};
