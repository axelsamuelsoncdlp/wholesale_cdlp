'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [token, setToken] = useState('')

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      handleVerification(tokenParam)
    }
  }, [searchParams])

  const handleVerification = async (verificationToken: string) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: verificationToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Email verification failed')
      } else {
        setSuccess('Email verified successfully! You can now sign in to your account.')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    // This would require implementing a resend verification endpoint
    setError('Please contact your administrator to resend the verification email.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-light text-gray-900">
            Email Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Verifying your email address
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Verification
            </CardTitle>
            <CardDescription>
              Please wait while we verify your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Verifying your email address...</p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {!token && !isLoading && (
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  No verification token provided. Please check your email for the verification link.
                </p>
                <Button
                  onClick={handleResendVerification}
                  variant="outline"
                >
                  Resend Verification Email
                </Button>
              </div>
            )}

            {error && !isLoading && (
              <div className="text-center space-y-4">
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  Go to Login
                </Button>
                <Button
                  onClick={handleResendVerification}
                  variant="outline"
                  className="w-full"
                >
                  Resend Verification Email
                </Button>
              </div>
            )}

            {success && (
              <div className="text-center">
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  Continue to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            If you're having trouble verifying your email, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  )
}
