import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Copy, Trash2, Download } from 'lucide-react'
import Link from 'next/link'
import { getShop, ShopifyClient } from '@/lib/shopify'
import { headers } from 'next/headers'

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

export default async function DashboardPage() {
  // Get shop from headers (set by middleware)
  const headersList = await headers()
  const shop = headersList.get('x-shop')

  // Check if shop is authenticated
  let shopData = null
  let productCount = 0

  if (shop) {
    try {
      shopData = await getShop(shop)
      if (shopData) {
        const client = new ShopifyClient(shop, shopData.accessToken)
        const products = await client.getProducts(10) // Get first 10 products
        productCount = products.edges.length
      }
    } catch (error) {
      console.error('Error fetching shop data:', error)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-foreground">
            Linesheet Generator
          </h1>
          <p className="text-muted-foreground mt-2">
            {shopData 
              ? `Connected to ${shopData.domain}.myshopify.com • ${productCount} products available`
              : 'Create professional wholesale linesheets from your Shopify products'
            }
          </p>
        </div>
        <Link href="/app/products">
          <Button size="lg" className="gap-2" disabled={!shopData}>
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

      {/* Connection Status */}
      {!shopData && (
        <Card className="mb-8 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="text-lg text-yellow-800 dark:text-yellow-200">
              Shopify Store Not Connected
            </CardTitle>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              Connect your Shopify store to start creating linesheets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                Not Connected
              </span>
            </div>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
              In development mode, you can still test the product picker functionality.
            </p>
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
