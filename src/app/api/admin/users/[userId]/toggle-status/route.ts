import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { supabaseAdmin } from '@/lib/supabase'
import { deactivateUser } from '@/lib/auth'
import { logSecurityEvent } from '@/lib/security'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  const { userId } = await params
  const { isActive } = await request.json()

  try {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent admin from deactivating themselves
    if (userId === session.user.id && !isActive) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      )
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { isActive }
    })

    // If deactivating, also delete all sessions
    if (!isActive) {
      await db.session.deleteMany({
        where: { userId }
      })
    }

    logSecurityEvent({
      event: 'user_status_changed',
      userId: session.user.id,
      severity: 'high',
      details: {
        targetUserId: userId,
        targetUserEmail: user.email,
        newStatus: isActive ? 'active' : 'inactive'
      }
    })

    return NextResponse.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    )
  }
}
