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

const handler = NextAuth({
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

        const ip = req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'] || 'unknown'
        const userAgent = req.headers?.['user-agent'] || 'unknown'

        try {
          // Check brute force protection
          const bruteForceCheck = await checkBruteForceProtection(credentials.email, ip as string)
          if (bruteForceCheck.blocked) {
            await recordLoginAttempt(
              credentials.email,
              ip as string,
              userAgent as string,
              false,
              bruteForceCheck.reason
            )
            return null
          }

          // Find user
          const user = await findUserByEmail(credentials.email)
          if (!user || !user.hashedPassword) {
            await recordLoginAttempt(
              credentials.email,
              ip as string,
              userAgent as string,
              false,
              'User not found or no password set'
            )
            return null
          }

          // Check if user is active
          if (!user.isActive) {
            await recordLoginAttempt(
              credentials.email,
              ip as string,
              userAgent as string,
              false,
              'Account is deactivated',
              user.id
            )
            return null
          }

          // Verify password
          const passwordValid = await verifyPassword(credentials.password, user.hashedPassword)
          if (!passwordValid) {
            await recordLoginAttempt(
              credentials.email,
              ip as string,
              userAgent as string,
              false,
              'Invalid password',
              user.id
            )

            // Check if we should lock the account
            const recentFailures = await db.loginAttempt.count({
              where: {
                userId: user.id,
                success: false,
                createdAt: {
                  gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
                }
              }
            })

            if (recentFailures >= 4) { // 5th failure
              await lockUserAccount(user.id, 'Too many failed login attempts')
            }

            return null
          }

          // Check MFA if enabled
          if (user.mfaEnabled && user.mfaSecret) {
            if (!credentials.mfaToken) {
              await recordLoginAttempt(
                credentials.email,
                ip as string,
                userAgent as string,
                false,
                'MFA token required',
                user.id
              )
              return null
            }

            const mfaValid = verifyMFACode(user.mfaSecret, credentials.mfaToken)
            if (!mfaValid) {
              await recordLoginAttempt(
                credentials.email,
                ip as string,
                userAgent as string,
                false,
                'Invalid MFA token',
                user.id
              )
              return null
            }
          }

          // Check if user is approved (active)
          if (!user.isActive) {
            await recordLoginAttempt(
              credentials.email,
              ip as string,
              userAgent as string,
              false,
              'Account pending approval',
              user.id
            )
            return null
          }

          // Successful login
          await recordLoginAttempt(
            credentials.email,
            ip as string,
            userAgent as string,
            true,
            undefined,
            user.id
          )

          await updateUserLastLogin(user.id, ip as string)

          logSecurityEvent({
            event: 'user_login_success',
            userId: user.id,
            severity: 'low',
            details: {
              email: user.email,
              ip,
              mfaUsed: user.mfaEnabled
            }
          })

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            mfaEnabled: user.mfaEnabled,
            emailVerified: user.emailVerified,
            isActive: user.isActive
          }
        } catch (error) {
          console.error('Authentication error:', error)
          await recordLoginAttempt(
            credentials.email,
            ip as string,
            userAgent as string,
            false,
            'System error'
          )
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
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
        token.isActive = user.isActive
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.mfaEnabled = token.mfaEnabled as boolean
        session.user.emailVerified = token.emailVerified as boolean
        session.user.isActive = token.isActive as boolean
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Additional sign-in checks can be added here
      return true
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  events: {
    async signOut({ token }) {
      if (token?.sub) {
        logSecurityEvent({
          event: 'user_logout',
          userId: token.sub,
          severity: 'low',
          details: {
            email: token.email
          }
        })
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }
