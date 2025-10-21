import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth-config'

export async function GET(request: NextRequest) {
  return auth(request)
}

export async function POST(request: NextRequest) {
  return auth(request)
}