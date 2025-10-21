import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { db } from '@/lib/db'
import { logSecurityEvent } from '@/lib/security'

export async function GET(request: NextRequest) {
  const session = await auth()
  
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        mfaEnabled: true,
        emailVerified: true,
        lastLoginAt: true,
        lastLoginIp: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      users
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
