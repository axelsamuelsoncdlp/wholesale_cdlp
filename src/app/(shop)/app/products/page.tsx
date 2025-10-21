'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, ShoppingCart, ArrowRight, X, Loader2, Package } from 'lucide-react'
import Link from 'next/link'
import { ShopifyProduct } from '@/lib/shopify'
import { useLinesheet } from '@/contexts/LinesheetContext'
// import { useAuth } from '@/contexts/AuthContext' // Temporarily disabled for testing
// import { useAuthenticatedFetch } from '@/lib/apiClient' // Temporarily disabled for testing

// Removed unused interface

export default function ProductsPage() {
  // Temporarily disabled authentication for testing
  
  const { 
    selectedProducts, 
    addSelectedProduct, 
    removeSelectedProduct, 
    clearSelectedProducts, 
    isProductSelected 
  } = useLinesheet()
  
  const [products, setProducts] = useState<ShopifyProduct[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCollection, setSelectedCollection] = useState<string>('')
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [collections, setCollections] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [endCursor, setEndCursor] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch filters on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch('/api/products/filters')
        const data = await response.json()
        
        if (response.ok) {
          setCollections(data.collections || [])
          setTags(data.tags || [])
        }
      } catch (err) {
        console.error('Error fetching filters:', err)
      }
    }

    fetchFilters()
  }, [])

  // Fetch products with search and filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const params = new URLSearchParams({ first: '50' })
        if (debouncedSearch) params.append('search', debouncedSearch)
        if (selectedCollection) params.append('collection', selectedCollection)
        if (selectedTag) params.append('tag', selectedTag)
        
        const response = await fetch(`/api/products?${params}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch products')
        }
        
        // Transform Shopify products
        const productsData = data.edges.map((edge: { node: ShopifyProduct }) => edge.node)
        
        setProducts(productsData)
        setHasNextPage(data.pageInfo.hasNextPage)
        setEndCursor(data.pageInfo.endCursor)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [debouncedSearch, selectedCollection, selectedTag])

  // Load more products function
  const loadMoreProducts = async () => {
    if (!hasNextPage || !endCursor || isLoadingMore) return

    try {
      setIsLoadingMore(true)
      
      const params = new URLSearchParams({ first: '50', after: endCursor })
      if (debouncedSearch) params.append('search', debouncedSearch)
      if (selectedCollection) params.append('collection', selectedCollection)
      if (selectedTag) params.append('tag', selectedTag)
      
      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch more products')
      }
      
      // Transform new products and append to existing ones
      const newProductsData = data.edges.map((edge: { node: ShopifyProduct }) => edge.node)
      
      setProducts(prev => [...prev, ...newProductsData])
      setHasNextPage(data.pageInfo.hasNextPage)
      setEndCursor(data.pageInfo.endCursor)
    } catch (err) {
      console.error('Error loading more products:', err)
      setError(err instanceof Error ? err.message : 'Failed to load more products')
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Clear filters function
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCollection('')
    setSelectedTag('')
  }

  // Filter products based on showSelectedOnly
  const displayProducts = showSelectedOnly 
    ? products.filter(product => isProductSelected(product.id))
    : products

  // Handle product selection
  const handleProductSelect = (product: ShopifyProduct, selected: boolean) => {
    if (selected) {
      addSelectedProduct(product)
    } else {
      removeSelectedProduct(product.id)
    }
  }

  // Handle select all
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      displayProducts.forEach(product => addSelectedProduct(product))
    } else {
      clearSelectedProducts()
    }
  }

  // Temporarily disabled authentication for testing

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Product Selection</h1>
          <p className="text-muted-foreground mt-2">
            Choose products for your linesheet
          </p>
        </div>

        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200">
              Error Loading Products
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 dark:text-red-400">
              Make sure your Shopify store is connected and you have the necessary permissions.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading products
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Product Selection</h1>
          <p className="text-muted-foreground mt-2">
            Choose products for your linesheet ({selectedProducts.length} selected)
          </p>
        </div>
        
            <div className="flex items-center space-x-2">
              {selectedProducts.length > 0 && (
                <Button variant="outline" onClick={clearSelectedProducts}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
              
              <Link href="/app/layout">
                <Button disabled={selectedProducts.length === 0}>
                  Continue to Layout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, SKU, or tag..."
            className="pl-10"
          />
        </div>
        
        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="border rounded px-3 py-2 min-w-[150px]"
          >
            <option value="">All Collections</option>
            {collections.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="border rounded px-3 py-2 min-w-[150px]"
          >
            <option value="">All Tags</option>
            {tags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          
          {(debouncedSearch || selectedCollection || selectedTag) && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
        
        {/* Show selected only checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-selected"
            checked={showSelectedOnly}
            onCheckedChange={(checked) => setShowSelectedOnly(checked as boolean)}
          />
          <label htmlFor="show-selected" className="text-sm font-medium">
            Show selected only
          </label>
        </div>
      </div>

      {/* Products Grid */}
      {displayProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedCollection || selectedTag ? 'Try adjusting your search terms or filters' : 'No products available in your store'}
            </p>
          </CardContent>
        </Card>
      ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {product.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {product.handle}
                        </CardDescription>
                      </div>
                      <Checkbox
                        checked={isProductSelected(product.id)}
                        onCheckedChange={(checked) => 
                          handleProductSelect(product, checked as boolean)
                        }
                      />
                    </div>
                  </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Product Image */}
                  {product.images.edges.length > 0 && (
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.images.edges[0].node.url}
                        alt={product.images.edges[0].node.altText || product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Product Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Variants:</span>
                      <span>{product.variants.edges.length}</span>
                    </div>
                    
                    {product.variants.edges.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price:</span>
                        <span>${parseFloat(product.variants.edges[0].node.price).toFixed(2)}</span>
                      </div>
                    )}
                    
                    {/* Metafields */}
                    {product.metafields.edges.length > 0 && (
                      <div className="space-y-1">
                        {product.metafields.edges
                          .filter(edge => edge.node.key === 'season' || edge.node.key === 'style_number')
                          .map(edge => (
                            <div key={edge.node.id} className="flex justify-between text-sm">
                              <span className="text-muted-foreground capitalize">
                                {edge.node.key.replace('_', ' ')}:
                              </span>
                              <span>{edge.node.value}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center mt-8">
          <Button 
            onClick={loadMoreProducts} 
            disabled={isLoadingMore}
            variant="outline"
            className="gap-2"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Load More Products
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Products Count */}
      <div className="text-center text-sm text-muted-foreground mt-4">
        Showing {products.length} products
        {hasNextPage && ' (more available)'}
      </div>

      {/* Selected Products Summary */}
      {selectedProducts.length > 0 && (
        <Card className="sticky bottom-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <Link href="/app/layout">
                <Button>
                  Continue to Layout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}