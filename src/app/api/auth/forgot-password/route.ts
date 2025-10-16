import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { findUserByEmail, generateEmailVerificationToken } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'
import { logSecurityEvent } from '@/lib/security'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await findUserByEmail(email)
    
    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user && user.isActive) {
      // Generate reset token
      const resetToken = generateEmailVerificationToken()
      
      // Store reset token
      await db.verificationToken.create({
        data: {
          identifier: email,
          token: resetToken,
          expires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
      })

      // Send password reset email
      await sendPasswordResetEmail(email, resetToken)

      logSecurityEvent({
        event: 'password_reset_requested',
        userId: user.id,
        severity: 'low',
        details: {
          email,
          ip
        }
      })
    }

    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    })

  } catch (error) {
    console.error('Password reset request error:', error)
    
    logSecurityEvent({
      event: 'password_reset_error',
      severity: 'high',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip
      }
    })

    return NextResponse.json(
      { error: 'Password reset request failed. Please try again.' },
      { status: 500 }
    )
  }
}
