import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { supabaseAdmin } from '@/lib/supabase'
import { enableMFA } from '@/lib/auth'
import { generateMFASetup } from '@/lib/mfa'
import { logSecurityEvent } from '@/lib/security'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  try {
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

    // Check if MFA is already enabled
    if (user.mfaEnabled) {
      return NextResponse.json(
        { error: 'MFA is already enabled for this account' },
        { status: 400 }
      )
    }

    // Generate MFA setup
    const mfaSetup = await generateMFASetup(user.email)

    // Store the secret temporarily (will be enabled after verification)
    await db.user.update({
      where: { id: user.id },
      data: { mfaSecret: mfaSetup.secret }
    })

    logSecurityEvent({
      event: 'mfa_setup_initiated',
      userId: user.id,
      severity: 'low',
      details: {
        email: user.email,
        ip
      }
    })

    return NextResponse.json({
      secret: mfaSetup.secret,
      qrCodeUrl: mfaSetup.qrCodeUrl,
      backupCodes: mfaSetup.backupCodes
    })

  } catch (error) {
    console.error('MFA setup error:', error)
    
    logSecurityEvent({
      event: 'mfa_setup_error',
      userId: session.user.id,
      severity: 'high',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip
      }
    })

    return NextResponse.json(
      { error: 'MFA setup failed. Please try again.' },
      { status: 500 }
    )
  }
}
