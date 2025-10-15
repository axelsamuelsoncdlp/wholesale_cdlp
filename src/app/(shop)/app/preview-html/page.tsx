'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Eye, ArrowLeft, Loader2, FileText } from 'lucide-react'
import { useLinesheet } from '@/contexts/LinesheetContext'
import Link from 'next/link'

export default function PreviewHtmlPage() {
  const { selectedProducts, config } = useLinesheet()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: selectedProducts,
          config: config,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `linesheet-${config.season}-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const getProductPrice = (product: any): string => {
    if (product.variants.edges.length > 0) {
      const variant = product.variants.edges[0].node
      return `${config.currency} ${parseFloat(variant.price).toFixed(2)}`
    }
    return 'N/A'
  }

  const getProductSizes = (product: any): string => {
    const sizes = new Set<string>()
    product.variants.edges.forEach((edge: any) => {
      edge.node.selectedOptions.forEach((option: any) => {
        if (option.name.toLowerCase().includes('size')) {
          sizes.add(option.value)
        }
      })
    })
    return Array.from(sizes).join(', ') || 'One Size'
  }

  const getProductColors = (product: any): string => {
    const colors = new Set<string>()
    product.variants.edges.forEach((edge: any) => {
      edge.node.selectedOptions.forEach((option: any) => {
        if (option.name.toLowerCase().includes('color')) {
          colors.add(option.value)
        }
      })
    })
    return Array.from(colors).join(', ') || 'Multiple'
  }

  const getProductSeason = (product: any): string => {
    const seasonMetafield = product.metafields.edges.find(
      (edge: any) => edge.node.key === 'season'
    )
    return seasonMetafield?.node.value || config.season
  }

  const getProductStyleNumber = (product: any): string => {
    const styleMetafield = product.metafields.edges.find(
      (edge: any) => edge.node.key === 'style_number'
    )
    return styleMetafield?.node.value || product.handle.toUpperCase()
  }

  if (selectedProducts.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-semibold mb-2">No Products Selected</h1>
          <p className="text-muted-foreground mb-6">
            Please select some products before previewing your linesheet.
          </p>
          <Link href="/app/products">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight">HTML Preview</h1>
          <p className="text-muted-foreground mt-2">
            HTML representation of your linesheet layout
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedProducts.length} products • {config.headerTitle}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/app/layout">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Layout
            </Button>
          </Link>
          <Button 
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* HTML Linesheet Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Linesheet Preview (HTML)
          </CardTitle>
          <CardDescription>
            This is how your linesheet will look when converted to PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-8 border rounded-lg" style={{ minHeight: '800px' }}>
            {/* Header */}
            <div className="text-center border-b pb-4 mb-6">
              <h1 className="text-2xl font-bold mb-2">{config.headerTitle}</h1>
              <h2 className="text-lg mb-2">{config.subheader}</h2>
              <p className="text-sm italic">{config.season}</p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 gap-6">
              {selectedProducts.map((product) => (
                <div key={product.id} className="border rounded p-4">
                  {/* Product Image */}
                  {config.fieldToggles.images && product.images.edges.length > 0 && (
                    <div className="mb-3">
                      <img
                        src={product.images.edges[0].node.url}
                        alt={product.title}
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}

                  {/* Product Details */}
                  <div className="space-y-2">
                    {config.fieldToggles.productName && (
                      <h3 className="font-bold text-lg">{product.title}</h3>
                    )}
                    
                    {config.fieldToggles.styleNumber && (
                      <p className="text-sm text-gray-600">
                        Style: {getProductStyleNumber(product)}
                      </p>
                    )}

                    {config.fieldToggles.season && (
                      <div className="flex justify-between text-sm">
                        <span>Season:</span>
                        <span>{getProductSeason(product)}</span>
                      </div>
                    )}

                    {config.fieldToggles.wholesalePrice && (
                      <div className="flex justify-between text-sm">
                        <span>Wholesale:</span>
                        <span className="font-bold">{getProductPrice(product)}</span>
                      </div>
                    )}

                    {config.fieldToggles.msrpPrice && (
                      <div className="flex justify-between text-sm">
                        <span>MSRP:</span>
                        <span className="font-bold">{getProductPrice(product)}</span>
                      </div>
                    )}

                    {config.fieldToggles.sizes && (
                      <div className="flex justify-between text-sm">
                        <span>Sizes:</span>
                        <span>{getProductSizes(product)}</span>
                      </div>
                    )}

                    {config.fieldToggles.colors && (
                      <div className="flex justify-between text-sm">
                        <span>Colors:</span>
                        <span>{getProductColors(product)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center mt-8 pt-4 border-t text-sm text-gray-500">
              Generated on {new Date().toLocaleDateString()} • {selectedProducts.length} products
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Panel */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Current linesheet settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Header</h4>
              <p className="text-sm text-muted-foreground">{config.headerTitle}</p>
              <p className="text-sm text-muted-foreground">{config.subheader}</p>
              <p className="text-sm text-muted-foreground">{config.season}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Pricing</h4>
              <p className="text-sm text-muted-foreground">Currency: {config.currency}</p>
              <p className="text-sm text-muted-foreground">Source: {config.priceSource}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Visible Fields</h4>
              <div className="space-y-1">
                {Object.entries(config.fieldToggles).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {value ? 'On' : 'Off'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
