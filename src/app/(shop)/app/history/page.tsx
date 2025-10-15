'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText, Calendar, HardDrive, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// Mock history data
const mockHistory = [
  {
    id: '1',
    filename: 'Linesheet_CDLP_SS26_MENS_2024-10-15.pdf',
    presetName: 'CDLP SS26 Mens Collection',
    size: '2.4 MB',
    createdAt: new Date('2024-10-15T14:30:00'),
    productCount: 24,
  },
  {
    id: '2',
    filename: 'Linesheet_CDLP_AW25_WHOLESALE_2024-10-14.pdf',
    presetName: 'CDLP AW25 Wholesale',
    size: '1.8 MB',
    createdAt: new Date('2024-10-14T16:45:00'),
    productCount: 18,
  },
  {
    id: '3',
    filename: 'Linesheet_CDLP_SS26_MENS_2024-10-13.pdf',
    presetName: 'CDLP SS26 Mens Collection',
    size: '2.2 MB',
    createdAt: new Date('2024-10-13T11:20:00'),
    productCount: 22,
  },
]

export default function HistoryPage() {
  const { isLoading: authLoading } = useAuth()

  // Temporarily disabled authentication for testing
  // Show loading state if auth is still loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-foreground">
            Render History
          </h1>
          <p className="text-muted-foreground mt-2">
            View and download previously generated linesheets
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{mockHistory.length}</div>
                <div className="text-sm text-muted-foreground">Total Files</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HardDrive className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold">6.4 MB</div>
                <div className="text-sm text-muted-foreground">Total Size</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold">3 days</div>
                <div className="text-sm text-muted-foreground">Last Generated</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Linesheets</CardTitle>
          <CardDescription>
            All previously rendered PDF files with download links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.filename}</h3>
                    <p className="text-sm text-muted-foreground">
                      Based on &quot;{item.presetName}&quot; • {item.productCount} products
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.createdAt.toLocaleDateString()} at {item.createdAt.toLocaleTimeString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {item.size}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State (hidden when there's data) */}
      {mockHistory.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No generated linesheets yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Once you generate your first linesheet, it will appear here for easy access and re-downloading.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
