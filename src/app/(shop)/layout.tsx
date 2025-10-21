import Sidebar from '@/components/Sidebar'
import { LinesheetProvider } from '@/contexts/LinesheetContext'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
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
  )
}
