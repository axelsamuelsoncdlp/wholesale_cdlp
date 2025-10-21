export const dynamic = 'force-dynamic'

import { SessionProvider } from 'next-auth/react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </SessionProvider>
  )
}
