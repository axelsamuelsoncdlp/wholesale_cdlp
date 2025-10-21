import { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabaseAdmin } from './supabase'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Find user in database
          const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (error || !user) {
            console.log('User not found:', credentials.email)
            return null
          }

          // Check if user is active
          if (!user.is_active) {
            console.log('User not active:', credentials.email)
            return null
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.hashed_password)
          if (!isValidPassword) {
            console.log('Invalid password for:', credentials.email)
            return null
          }

          console.log('Login successful for:', credentials.email)
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.email
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
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: true, // Enable debug logging
}

export default NextAuth(authOptions)
