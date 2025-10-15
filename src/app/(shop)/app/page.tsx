'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Copy, Trash2, Download, Loader2, Store } from 'lucide-react'
import Link from 'next/link'
// import { useAuth } from '@/contexts/AuthContext' // Temporarily disabled for testing
// import { useAuthenticatedFetch } from '@/lib/apiClient' // Temporarily disabled for testing

// Real data interfaces
interface ShopData {
  name?: string
  domain?: string
  email?: string
  plan?: {
    displayName: string
  }
  currencyCode?: string
  timezone?: string
}

export default function DashboardPage() {
  // Temporarily disabled authentication for testing
  
  const [presets, setPresets] = useState<Array<{
    id: string
    name: string
    productCount: number
    lastModified: string
    status: 'draft' | 'published'
  }>>([]) // Will be empty for now - no presets saved yet
  const [shopData, setShopData] = useState<ShopData | null>(null)
  const [productCount, setProductCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real shop data and product count
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch shop data and product count in parallel
        const [shopResponse, productsResponse] = await Promise.all([
          fetch('/api/shop'),
          fetch('/api/products?first=1') // Just get count, not all products
        ])

        if (!shopResponse.ok) {
          throw new Error('Failed to fetch shop data')
        }

        const shopDataResult = await shopResponse.json()
        setShopData(shopDataResult.shop)

        if (productsResponse.ok) {
          // Get total count by fetching first page with larger limit
          const countResponse = await fetch('/api/products?first=250')
          if (countResponse.ok) {
            const countData = await countResponse.json()
            setProductCount(countData.edges.length)
          }
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleDeletePreset = (id: string) => {
    setPresets(prev => prev.filter(preset => preset.id !== id))
  }

  const handleDuplicatePreset = (id: string) => {
    const preset = presets.find(p => p.id === id)
    if (preset) {
      const newPreset = {
        ...preset,
        id: Date.now().toString(),
        name: `${preset.name} (Copy)`,
        lastModified: new Date().toISOString().split('T')[0],
        status: 'draft' as const
      }
      setPresets(prev => [...prev, newPreset])
    }
  }

  // Temporarily disabled authentication for testing

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome to CDLP Linesheet Generator
          </p>
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <Store className="h-4 w-4 mr-1" />
            {shopData ? (
              <>
                Connected to {shopData.name || shopData.domain || 'cdlpstore'}
                {shopData.plan && ` (${shopData.plan.displayName})`}
              </>
            ) : (
              'Connected to cdlpstore'
            )}
          </div>
        </div>
        <Link href="/app/products">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Linesheet
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                productCount.toLocaleString()
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Available in your store
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Linesheet Presets</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presets.length}</div>
            <p className="text-xs text-muted-foreground">
              Saved templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {presets.filter(p => p.status === 'published').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready to share
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Presets */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Recent Linesheet Presets</h2>
          <Link href="/app/history">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 mb-6">
            <CardHeader>
              <CardTitle className="text-red-800 dark:text-red-200">
                Error Loading Data
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300">
                {error}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {presets.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {presets.map((preset) => (
              <Card key={preset.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{preset.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicatePreset(preset.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePreset(preset.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {preset.productCount} products • Modified {preset.lastModified}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      preset.status === 'published' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {preset.status}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No linesheet presets yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first linesheet to get started with your {productCount} products
              </p>
              <Link href="/app/products">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Linesheet
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}