import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyUserEmail } from '@/lib/auth'
import { logSecurityEvent } from '@/lib/security'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find verification token
    const verificationToken = await db.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      logSecurityEvent({
        event: 'email_verification_invalid_token',
        severity: 'medium',
        details: { token: token.substring(0, 8) + '...', ip }
      })
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      await db.verificationToken.delete({
        where: { token }
      })
      
      logSecurityEvent({
        event: 'email_verification_expired_token',
        severity: 'medium',
        details: { email: verificationToken.identifier, ip }
      })
      
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: verificationToken.identifier }
    })

    if (!user) {
      logSecurityEvent({
        event: 'email_verification_user_not_found',
        severity: 'high',
        details: { email: verificationToken.identifier, ip }
      })
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      await db.verificationToken.delete({
        where: { token }
      })
      
      return NextResponse.json({
        message: 'Email is already verified'
      })
    }

    // Verify user email
    await verifyUserEmail(user.id)

    // Delete verification token
    await db.verificationToken.delete({
      where: { token }
    })

    logSecurityEvent({
      event: 'email_verified',
      userId: user.id,
      severity: 'low',
      details: {
        email: user.email,
        ip
      }
    })

    return NextResponse.json({
      message: 'Email verified successfully'
    })

  } catch (error) {
    console.error('Email verification error:', error)
    
    logSecurityEvent({
      event: 'email_verification_error',
      severity: 'high',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip
      }
    })

    return NextResponse.json(
      { error: 'Email verification failed. Please try again.' },
      { status: 500 }
    )
  }
}
