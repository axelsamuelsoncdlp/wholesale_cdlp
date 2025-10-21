'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, Smartphone, Copy, CheckCircle } from 'lucide-react'
import { MFA_INSTRUCTIONS } from '@/lib/mfa'

export default function MFASetupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mfaToken, setMfaToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mfaData, setMfaData] = useState<{
    secret: string
    qrCodeUrl: string
    backupCodes: string[]
  } | null>(null)
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    if (session.user.mfaEnabled) {
      router.push('/app')
      return
    }

    // Generate MFA setup data
    generateMFAData()
  }, [session, status, router])

  const generateMFAData = async () => {
    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/auth/setup-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to generate MFA setup')
      } else {
        setMfaData(data)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: mfaToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'MFA verification failed')
      } else {
        setSuccess('Two-factor authentication has been successfully enabled!')
        setShowBackupCodes(true)
        setTimeout(() => {
          router.push('/app')
        }, 3000)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (status === 'loading' || isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Setting up two-factor authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-light text-gray-900">
            Set Up Two-Factor Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enhance your account security with two-factor authentication
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Setup Required
            </CardTitle>
            <CardDescription>
              Two-factor authentication is required for all CDLP Linesheet Generator accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {!showBackupCodes && mfaData && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Step 1: Install an Authenticator App</h3>
                  <p className="text-sm text-gray-600">
                    Download one of these recommended authenticator apps on your mobile device:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Google Authenticator</li>
                    <li>Authy</li>
                    <li>1Password</li>
                    <li>Microsoft Authenticator</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Step 2: Scan the QR Code</h3>
                  <div className="flex justify-center">
                    <img
                      src={mfaData.qrCodeUrl}
                      alt="MFA QR Code"
                      className="border rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Scan this QR code with your authenticator app
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Step 3: Enter Verification Code</h3>
                  <form onSubmit={handleVerify} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="mfaToken" className="text-sm font-medium text-gray-700">
                        Enter the 6-digit code from your authenticator app
                      </label>
                      <Input
                        id="mfaToken"
                        type="text"
                        value={mfaToken}
                        onChange={(e) => setMfaToken(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || mfaToken.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify and Enable MFA'
                      )}
                    </Button>
                  </form>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Smartphone className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">Important Security Note</p>
                      <p className="text-yellow-700 mt-1">
                        Make sure to save your backup codes in a secure location. 
                        You&apos;ll need them if you lose access to your authenticator app.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {showBackupCodes && mfaData && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Step 4: Save Your Backup Codes</h3>
                <p className="text-sm text-gray-600">
                  These backup codes can be used to access your account if you lose your authenticator device. 
                  Each code can only be used once.
                </p>
                
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {mfaData.backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                        <span>{code}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(code)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>Important:</strong> Store these backup codes in a secure location. 
                    If you lose both your authenticator app and these codes, you may be locked out of your account.
                  </p>
                </div>

                <Button
                  onClick={() => router.push('/app')}
                  className="w-full"
                >
                  Continue to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
