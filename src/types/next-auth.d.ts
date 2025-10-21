import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      mfaEnabled: boolean
      isActive: boolean
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: string
    mfaEnabled: boolean
    isActive: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    mfaEnabled: boolean
    isActive: boolean
  }
}
