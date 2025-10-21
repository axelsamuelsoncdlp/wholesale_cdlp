import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { db } from '@/lib/db'
import { sendUserApprovedEmail } from '@/lib/email'
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

    // Activate user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { isActive: true }
    })

    // Send approval email to user
    await sendUserApprovedEmail(user.email)

    logSecurityEvent({
      event: 'user_approved',
      userId: session.user.id,
      severity: 'low',
      details: {
        targetUserId: userId,
        targetUserEmail: user.email,
        approvedBy: session.user.email
      }
    })

    return NextResponse.json({
      message: 'User approved successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error approving user:', error)
    return NextResponse.json(
      { error: 'Failed to approve user' },
      { status: 500 }
    )
  }
}
