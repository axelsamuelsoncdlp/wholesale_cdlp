'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Copy, Trash2, Download, AlertCircle, Loader2, Store } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthenticatedFetch } from '@/lib/apiClient'

// Mock data for development
const mockPresets = [
  {
    id: '1',
    name: 'SS24 Collection',
    productCount: 12,
    lastModified: '2024-01-15',
    status: 'draft' as const
  },
  {
    id: '2', 
    name: 'Core Essentials',
    productCount: 8,
    lastModified: '2024-01-10',
    status: 'published' as const
  },
  {
    id: '3',
    name: 'Limited Edition',
    productCount: 5,
    lastModified: '2024-01-08',
    status: 'draft' as const
  }
]

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading, error: authError, shop } = useAuth()
  const { authenticatedFetch } = useAuthenticatedFetch()
  
  const [presets, setPresets] = useState(mockPresets)
  const [shopData, setShopData] = useState<any>(null)
  const [productCount, setProductCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch shop data
  useEffect(() => {
    const fetchShopData = async () => {
      if (!isAuthenticated || authLoading) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch products count
        const productsResponse = await authenticatedFetch('/api/products?limit=1')
        const productsData = await productsResponse.json()
        
        setProductCount(productsData.edges?.length || 0)
      } catch (err) {
        console.error('Error fetching shop data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch shop data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchShopData()
  }, [isAuthenticated, authLoading, authenticatedFetch])

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

  // Show authentication loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    )
  }

  // Show authentication error
  if (authError || !isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome to CDLP Linesheet Generator
          </p>
        </div>

        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Authentication Required
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              {authError || 'You must be logged in to Shopify to access this page.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 dark:text-red-400">
              Please access this app through your Shopify Admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome to CDLP Linesheet Generator
          </p>
          {shop && (
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Store className="h-4 w-4 mr-1" />
              Connected to {shop}
            </div>
          )}
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

        {presets.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No linesheet presets yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first linesheet to get started
              </p>
              <Link href="/app/products">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Linesheet
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}