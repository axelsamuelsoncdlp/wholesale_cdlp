'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, ShoppingCart, ArrowRight, X } from 'lucide-react'
import Link from 'next/link'

// Mock product data
const mockProducts = [
  {
    id: '1',
    title: 'Essential Cotton T-Shirt',
    handle: 'essential-cotton-tshirt',
    image: '/placeholder-product.jpg',
    variants: [
      { id: '1-1', sku: 'ECT001', size: 'S', color: 'Black', price: '$25.00' },
      { id: '1-2', sku: 'ECT002', size: 'M', color: 'Black', price: '$25.00' },
      { id: '1-3', sku: 'ECT003', size: 'L', color: 'Black', price: '$25.00' },
      { id: '1-4', sku: 'ECT004', size: 'XL', color: 'Black', price: '$25.00' },
    ],
    season: 'SS26',
    styleNumber: 'ECT001',
  },
  {
    id: '2',
    title: 'Premium Denim Jacket',
    handle: 'premium-denim-jacket',
    image: '/placeholder-product.jpg',
    variants: [
      { id: '2-1', sku: 'PDJ001', size: 'S', color: 'Dark Navy', price: '$89.00' },
      { id: '2-2', sku: 'PDJ002', size: 'M', color: 'Dark Navy', price: '$89.00' },
      { id: '2-3', sku: 'PDJ003', size: 'L', color: 'Dark Navy', price: '$89.00' },
    ],
    season: 'SS26',
    styleNumber: 'PDJ001',
  },
  {
    id: '3',
    title: 'Classic Wool Sweater',
    handle: 'classic-wool-sweater',
    image: '/placeholder-product.jpg',
    variants: [
      { id: '3-1', sku: 'CWS001', size: 'S', color: 'Azure Blue', price: '$65.00' },
      { id: '3-2', sku: 'CWS002', size: 'M', color: 'Azure Blue', price: '$65.00' },
      { id: '3-3', sku: 'CWS003', size: 'L', color: 'Azure Blue', price: '$65.00' },
    ],
    season: 'AW25',
    styleNumber: 'CWS001',
  },
]

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [products] = useState(mockProducts)

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.styleNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(id => id !== productId))
  }

  const selectedProductsData = products.filter(p => selectedProducts.includes(p.id))

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-foreground">
            Product Selection
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose products for your linesheet and configure their order
          </p>
        </div>
        {selectedProducts.length > 0 && (
          <Link href="/app/layout">
            <Button size="lg" className="gap-2">
              Continue to Layout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products by name or style number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedProducts.includes(product.id) 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : ''
                }`}
                onClick={() => toggleProduct(product.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="w-16 h-16 bg-muted rounded-md mb-3 flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-sm mb-1 truncate">
                        {product.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Style: {product.styleNumber} • {product.season}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {product.variants.length} variants • {product.variants[0]?.price}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">
                  No products found matching &quot;{searchQuery}&quot;
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Selection Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Selected Products ({selectedProducts.length})
              </CardTitle>
              <CardDescription>
                Products will be included in your linesheet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedProductsData.length > 0 ? (
                <>
                  {selectedProductsData.map((product) => (
                    <div 
                      key={product.id}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                    >
                      <div className="w-10 h-10 bg-background rounded-md flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {product.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.styleNumber}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => removeProduct(product.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <Link href="/app/layout">
                      <Button className="w-full gap-2">
                        Continue to Layout
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No products selected yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Choose products from the grid to add them to your linesheet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
