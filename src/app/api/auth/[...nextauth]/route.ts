// @ts-expect-error - NextAuth v5 beta compatibility issue with Next.js 15
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { auth } from '@/lib/auth-config'

export const { GET, POST } = auth