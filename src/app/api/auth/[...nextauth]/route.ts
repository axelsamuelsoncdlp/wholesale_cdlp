// @ts-expect-error - NextAuth v5 beta compatibility issue with Next.js 15
/* eslint-disable @typescript-eslint/ban-ts-comment */
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth-config'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }