'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Eye, ArrowLeft, Loader2, FileText } from 'lucide-react'
import { useLinesheet } from '@/contexts/LinesheetContext'
import Link from 'next/link'

export default function PreviewPage() {
  const { selectedProducts, config } = useLinesheet()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generatePreview = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/preview', {
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
        throw new Error('Failed to generate preview')
      }

      const data = await response.json()
      setPreviewUrl(data.previewUrl)
    } catch (err) {
      console.error('Error generating preview:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate preview')
    } finally {
      setIsLoading(false)
    }
  }

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

  // Auto-generate preview when component mounts
  useEffect(() => {
    if (selectedProducts.length > 0) {
      generatePreview()
    }
  }, [selectedProducts, config])

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
          <h1 className="text-3xl font-light tracking-tight">PDF Preview</h1>
          <p className="text-muted-foreground mt-2">
            Preview your linesheet before downloading
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
            disabled={!previewUrl}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Preview Panel */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Linesheet Preview
              </CardTitle>
              <CardDescription>
                This is how your linesheet will look when downloaded
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Generating preview...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-4">
                    <FileText className="h-12 w-12 mx-auto mb-2" />
                    <p className="font-medium">Preview Error</p>
                  </div>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={generatePreview} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : previewUrl ? (
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    src={previewUrl}
                    className="w-full h-[800px] border-0"
                    title="Linesheet Preview"
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Click "Generate Preview" to see your linesheet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Configuration Panel */}
        <div className="lg:col-span-1">
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

              <div className="pt-4 border-t">
                <Button 
                  onClick={generatePreview} 
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  Refresh Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
