'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, Shield } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaToken, setMfaToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMfa, setShowMfa] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        mfaToken: showMfa ? mfaToken : undefined,
        redirect: false
      })

      if (result?.error) {
        if (result.error.includes('MFA')) {
          setShowMfa(true)
          setError('Please enter your two-factor authentication code')
        } else if (result.error.includes('pending') || result.error.includes('approval')) {
          setError('Your account is pending admin approval. Please wait for approval or contact your administrator.')
        } else {
          setError(result.error)
        }
      } else if (result?.ok) {
        // Check if user needs to complete MFA setup
        const session = await getSession()
        if (session?.user && !session.user.mfaEnabled) {
          router.push('/setup-mfa')
        } else {
          router.push('/app')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-light text-gray-900">
            CDLP Linesheet Generator
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your secure wholesale account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Secure Login
            </CardTitle>
            <CardDescription>
              Only @cdlp.com email addresses are allowed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.name@cdlp.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {showMfa && (
                <div className="space-y-2">
                  <label htmlFor="mfaToken" className="text-sm font-medium text-gray-700">
                    Two-Factor Authentication Code
                  </label>
                  <Input
                    id="mfaToken"
                    type="text"
                    value={mfaToken}
                    onChange={(e) => setMfaToken(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Contact your administrator if you need help with your account.
              </p>
              <div className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Register here
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            This is a secure system for CDLP wholesale team members only.
            All access is logged and monitored.
          </p>
        </div>
      </div>
    </div>
  )
}
