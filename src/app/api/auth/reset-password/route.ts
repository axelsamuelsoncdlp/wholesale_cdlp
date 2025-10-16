import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, enforcePasswordPolicy } from '@/lib/auth'
import { logSecurityEvent } from '@/lib/security'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  try {
    const { token, password, confirmPassword } = await request.json()

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Token, password, and confirmation are required' },
        { status: 400 }
      )
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Enforce password policy
    const passwordValidation = enforcePasswordPolicy(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Password does not meet requirements', details: passwordValidation.errors },
        { status: 400 }
      )
    }

    // Find reset token
    const resetToken = await db.verificationToken.findUnique({
      where: { token }
    })

    if (!resetToken) {
      logSecurityEvent({
        event: 'password_reset_invalid_token',
        severity: 'medium',
        details: { token: token.substring(0, 8) + '...', ip }
      })
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (resetToken.expires < new Date()) {
      await db.verificationToken.delete({
        where: { token }
      })
      
      logSecurityEvent({
        event: 'password_reset_expired_token',
        severity: 'medium',
        details: { email: resetToken.identifier, ip }
      })
      
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: resetToken.identifier }
    })

    if (!user) {
      logSecurityEvent({
        event: 'password_reset_user_not_found',
        severity: 'high',
        details: { email: resetToken.identifier, ip }
      })
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update user password
    await db.user.update({
      where: { id: user.id },
      data: { hashedPassword }
    })

    // Delete reset token
    await db.verificationToken.delete({
      where: { token }
    })

    logSecurityEvent({
      event: 'password_reset_success',
      userId: user.id,
      severity: 'low',
      details: {
        email: user.email,
        ip
      }
    })

    return NextResponse.json({
      message: 'Password reset successfully'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    
    logSecurityEvent({
      event: 'password_reset_error',
      severity: 'high',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip
      }
    })

    return NextResponse.json(
      { error: 'Password reset failed. Please try again.' },
      { status: 500 }
    )
  }
}
