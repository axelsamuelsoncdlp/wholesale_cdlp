import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { db } from '@/lib/db'
import { sendUserRejectedEmail } from '@/lib/email'
import { logSecurityEvent } from '@/lib/security'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth()
  
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  const { userId } = await params
  const { reason } = await request.json()

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

    if (user.isActive) {
      return NextResponse.json(
        { error: 'User is already approved' },
        { status: 400 }
      )
    }

    // Send rejection email to user
    await sendUserRejectedEmail(user.email, reason)

    // Delete the user account
    await db.user.delete({
      where: { id: userId }
    })

    logSecurityEvent({
      event: 'user_rejected',
      userId: session.user.id,
      severity: 'medium',
      details: {
        targetUserId: userId,
        targetUserEmail: user.email,
        rejectedBy: session.user.email,
        reason: reason || 'No reason provided'
      }
    })

    return NextResponse.json({
      message: 'User registration rejected and account deleted'
    })

  } catch (error) {
    console.error('Error rejecting user:', error)
    return NextResponse.json(
      { error: 'Failed to reject user' },
      { status: 500 }
    )
  }
}
