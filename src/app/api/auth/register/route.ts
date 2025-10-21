import { NextRequest, NextResponse } from 'next/server'
import { 
  createUser, 
  validateEmailDomain, 
  enforcePasswordPolicy,
  hashPassword
} from '@/lib/auth'
import { logSecurityEvent } from '@/lib/security'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  try {
    const { email, password, confirmPassword } = await request.json()

    // Validate input
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Email, password, and confirmation are required' },
        { status: 400 }
      )
    }

    // Validate email domain
    if (!validateEmailDomain(email)) {
      logSecurityEvent({
        event: 'registration_attempt_invalid_domain',
        severity: 'medium',
        details: { email, ip }
      })
      return NextResponse.json(
        { error: 'Only @cdlp.com email addresses are allowed' },
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

    // Create user with pending approval status
    const user = await createUser(email, await hashPassword(password), 'STANDARD')

    logSecurityEvent({
      event: 'user_registered_pending_approval',
      userId: user.id,
      severity: 'low',
      details: {
        email,
        ip
      }
    })

    return NextResponse.json({
      message: 'Registration successful! Your account is pending admin approval. Contact your administrator for access.',
      userId: user.id,
      status: 'pending_approval'
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    logSecurityEvent({
      event: 'registration_error',
      severity: 'high',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip
      }
    })

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
