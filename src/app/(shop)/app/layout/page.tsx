'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, Eye, Loader2 } from 'lucide-react'
import { useLinesheet } from '@/contexts/LinesheetContext'
import Link from 'next/link'

export default function LayoutPage() {
  const { selectedProducts, config, updateConfig } = useLinesheet()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const handleConfigChange = (field: string, value: string | boolean) => {
    const updates = { [field]: value } as Partial<typeof config>
    updateConfig(updates)
  }

  const handleFieldToggle = (field: keyof typeof config.fieldToggles) => {
    updateConfig({
      fieldToggles: {
        ...config.fieldToggles,
        [field]: !config.fieldToggles[field]
      }
    })
  }

  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true)
      
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
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-foreground">
            Layout Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize your linesheet layout, headers, and field visibility
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedProducts.length} products selected
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/app/preview">
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </Link>
          <Button 
            onClick={handleGeneratePDF}
            disabled={selectedProducts.length === 0 || isGeneratingPDF}
            className="gap-2"
          >
            {isGeneratingPDF ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Generate PDF
          </Button>
        </div>
      </div>

      {/* Selected Products Summary */}
      {selectedProducts.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selected Products ({selectedProducts.length})</CardTitle>
            <CardDescription>
              Products that will be included in your linesheet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedProducts.slice(0, 8).map((product) => (
                <div key={product.id} className="text-sm">
                  <div className="font-medium truncate">{product.title}</div>
                  <div className="text-muted-foreground">{product.handle}</div>
                </div>
              ))}
              {selectedProducts.length > 8 && (
                <div className="text-sm text-muted-foreground">
                  +{selectedProducts.length - 8} more products
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure global settings for your linesheet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="headerTitle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Header Title
              </label>
              <Input
                id="headerTitle"
                value={config.headerTitle}
                onChange={(e) => handleConfigChange('headerTitle', e.target.value)}
                placeholder="e.g., CDLP SS26 MENS"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="subheader" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Subheader
              </label>
              <Input
                id="subheader"
                value={config.subheader}
                onChange={(e) => handleConfigChange('subheader', e.target.value)}
                placeholder="e.g., MENS"
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="currency" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Currency
              </label>
              <Input
                id="currency"
                value={config.currency}
                onChange={(e) => handleConfigChange('currency', e.target.value)}
                placeholder="e.g., USD"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="season" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Season
              </label>
              <Input
                id="season"
                value={config.season}
                onChange={(e) => handleConfigChange('season', e.target.value)}
                placeholder="e.g., SS26"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label htmlFor="priceSource" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Price Source
            </label>
            <select
              id="priceSource"
              value={config.priceSource}
              onChange={(e) => handleConfigChange('priceSource', e.target.value)}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="price_list">Shopify Price List (B2B)</option>
              <option value="metafield">Product Metafield</option>
              <option value="variant_price">Default Variant Price</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Field Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Field Visibility</CardTitle>
          <CardDescription>Toggle which product fields are visible on the linesheet.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(config.fieldToggles).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={value}
                onCheckedChange={() => handleFieldToggle(key as keyof typeof config.fieldToggles)}
              />
              <label
                htmlFor={key}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
              >
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Link href="/app/products">
          <Button variant="outline">
            ← Back to Products
          </Button>
        </Link>
        
        <div className="flex gap-3">
          <Link href="/app/preview">
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview PDF
            </Button>
          </Link>
          <Button 
            onClick={handleGeneratePDF}
            disabled={selectedProducts.length === 0 || isGeneratingPDF}
            className="gap-2"
          >
            {isGeneratingPDF ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Generate & Download PDF
          </Button>
        </div>
      </div>
    </div>
  )
}