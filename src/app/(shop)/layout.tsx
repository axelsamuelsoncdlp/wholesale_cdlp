import Sidebar from '@/components/Sidebar'
import { LinesheetProvider } from '@/contexts/LinesheetContext'
import { SessionProvider } from 'next-auth/react'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <LinesheetProvider>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </LinesheetProvider>
    </SessionProvider>
  )
}
