import { NextRequest } from 'next/server'
import NextAuth from '@/lib/auth-config-simple'

export async function GET(request: NextRequest) {
  return NextAuth(request)
}

export async function POST(request: NextRequest) {
  return NextAuth(request)
}