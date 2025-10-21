import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-config'
import { db } from '@/lib/db'
import { enableMFA } from '@/lib/auth'
import { verifyMFACode } from '@/lib/mfa'
import { logSecurityEvent } from '@/lib/security'

export async function POST(request: NextRequest) {
  const session = await getSession()
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'MFA token is required' },
        { status: 400 }
      )
    }

    // Get user
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.mfaSecret) {
      return NextResponse.json(
        { error: 'MFA secret not found. Please start the setup process again.' },
        { status: 400 }
      )
    }

    // Verify MFA token
    const isValid = verifyMFACode(user.mfaSecret, token)
    
    if (!isValid) {
      logSecurityEvent({
        event: 'mfa_verification_failed',
        userId: user.id,
        severity: 'medium',
        details: {
          email: user.email,
          ip
        }
      })
      
      return NextResponse.json(
        { error: 'Invalid MFA token. Please try again.' },
        { status: 400 }
      )
    }

    // Enable MFA for the user
    await enableMFA(user.id, user.mfaSecret)

    logSecurityEvent({
      event: 'mfa_enabled',
      userId: user.id,
      severity: 'low',
      details: {
        email: user.email,
        ip
      }
    })

    return NextResponse.json({
      message: 'MFA has been successfully enabled for your account'
    })

  } catch (error) {
    console.error('MFA verification error:', error)
    
    logSecurityEvent({
      event: 'mfa_verification_error',
      userId: session.user.id,
      severity: 'high',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip
      }
    })

    return NextResponse.json(
      { error: 'MFA verification failed. Please try again.' },
      { status: 500 }
    )
  }
}
