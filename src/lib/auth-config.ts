import { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { db } from '@/lib/db'
import { 
  findUserByEmail, 
  verifyPassword, 
  recordLoginAttempt, 
  checkBruteForceProtection,
  updateUserLastLogin,
  lockUserAccount
} from '@/lib/auth'
import { verifyMFACode } from '@/lib/mfa'
import { logSecurityEvent } from '@/lib/security'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        mfaToken: { label: 'MFA Token', type: 'text', optional: true }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const ip = req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown'
        const userAgent = req?.headers?.['user-agent'] || 'unknown'

        try {
          // Check brute force protection
          const isBlocked = await checkBruteForceProtection(credentials.email, ip as string)
          if (isBlocked) {
            await recordLoginAttempt(
              credentials.email,
              ip as string,
              userAgent as string,
              false,
              'Account temporarily locked due to brute force protection'
            )
            return null
          }

          // Find user
          const user = await findUserByEmail(credentials.email)
          if (!user) {
            await recordLoginAttempt(
              credentials.email,
              ip as string,
              userAgent as string,
              false,
              'User not found'
            )
            return null
          }

          // Check if account is locked
          if (!user.isActive) {
            await recordLoginAttempt(
              credentials.email,
              ip as string,
              userAgent as string,
              false,
              'Account pending approval',
              user.id
            )
            return null // Prevent login if account is not active
          }

          // Verify password
          const isValidPassword = await verifyPassword(credentials.password, user.hashedPassword!)
          if (!isValidPassword) {
            await recordLoginAttempt(
              credentials.email,
              ip as string,
              userAgent as string,
              false,
              'Invalid password',
              user.id
            )
            return null
          }

          // Handle MFA if enabled
          if (user.mfaEnabled) {
            if (!credentials.mfaToken) {
              await recordLoginAttempt(
                credentials.email,
                ip as string,
                userAgent as string,
                false,
                'MFA token required',
                user.id
              )
              throw new Error('MFA token required')
            }

            const isValidMFA = await verifyMFACode(user.mfaSecret!, credentials.mfaToken)
            if (!isValidMFA) {
              await recordLoginAttempt(
                credentials.email,
                ip as string,
                userAgent as string,
                false,
                'Invalid MFA token',
                user.id
              )
              throw new Error('Invalid MFA token')
            }
          }

          // Successful login
          await recordLoginAttempt(
            credentials.email,
            ip as string,
            userAgent as string,
            true,
            'Successful login',
            user.id
          )

          await updateUserLastLogin(user.id, ip as string)
          await logSecurityEvent({
            event: 'user_login',
            userId: user.id,
            severity: 'low',
            details: {
              email: user.email,
              ip,
              userAgent,
              mfaUsed: user.mfaEnabled
            }
          })

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            mfaEnabled: user.mfaEnabled,
            emailVerified: user.emailVerified,
            isActive: user.isActive // Include isActive in user object
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.mfaEnabled = user.mfaEnabled
        token.emailVerified = user.emailVerified
        token.isActive = user.isActive // Add isActive to JWT
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.mfaEnabled = token.mfaEnabled as boolean
        session.user.emailVerified = token.emailVerified as boolean
        session.user.isActive = token.isActive as boolean // Add isActive to session
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Additional sign-in logic can be added here
      return true
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
}

// Export the auth function for use in API routes
export default NextAuth(authOptions)

// Export a helper function to get session
export async function getSession() {
  const { getServerSession } = await import('next-auth/next')
  return await getServerSession(authOptions)
}
