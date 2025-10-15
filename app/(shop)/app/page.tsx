import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Copy, Trash2, Download } from 'lucide-react'
import Link from 'next/link'

// Mock data for development
const mockPresets = [
  {
    id: '1',
    name: 'CDLP SS26 Mens Collection',
    season: 'SS26',
    productCount: 24,
    createdAt: new Date('2024-10-15'),
    headerTitle: 'CDLP SS26 MENS',
  },
  {
    id: '2', 
    name: 'CDLP AW25 Wholesale',
    season: 'AW25',
    productCount: 18,
    createdAt: new Date('2024-10-14'),
    headerTitle: 'CDLP AW25 MENS',
  },
]

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-foreground">
            Linesheet Generator
          </h1>
          <p className="text-muted-foreground mt-2">
            Create professional wholesale linesheets from your Shopify products
          </p>
        </div>
        <Link href="/app/products">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            New Linesheet
          </Button>
        </Link>
      </div>

      {/* Presets Grid */}
      {mockPresets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPresets.map((preset) => (
            <Card key={preset.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium">
                      {preset.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {preset.productCount} products • {preset.season}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Created {preset.createdAt.toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button size="sm" className="flex-1 gap-2">
                      <Download className="h-3 w-3" />
                      Render PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No linesheets yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first professional linesheet by selecting products and configuring your layout.
            </p>
            <Link href="/app/products">
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Linesheet
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Product Selection</CardTitle>
            <CardDescription>
              Choose products and configure your linesheet content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/products">
              <Button variant="outline" className="w-full">
                Select Products
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Layout Configuration</CardTitle>
            <CardDescription>
              Customize headers, pricing, and field visibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Configure Layout
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Render History</CardTitle>
            <CardDescription>
              View and download previously generated linesheets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/history">
              <Button variant="outline" className="w-full">
                View History
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
