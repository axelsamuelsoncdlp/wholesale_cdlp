'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, Save, Eye, Settings, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LayoutPage() {
  const { isLoading: authLoading } = useAuth()
  
  const [config, setConfig] = useState({
    headerTitle: 'CDLP SS26 MENS',
    subheader: 'MENS',
    currency: 'USD',
    priceSource: 'price_list' as 'price_list' | 'metafield' | 'variant_price',
    season: 'SS26',
    fieldToggles: {
      styleNumber: true,
      season: true,
      wholesale: true,
      msrp: true,
      sizes: true,
      color: true,
    },
  })

  const updateFieldToggle = (field: keyof typeof config.fieldToggles) => {
    setConfig(prev => ({
      ...prev,
      fieldToggles: {
        ...prev.fieldToggles,
        [field]: !prev.fieldToggles[field]
      }
    }))
  }

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
            Layout Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize your linesheet layout, headers, and field visibility
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Save Preset
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Render PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Header Settings
              </CardTitle>
              <CardDescription>
                Configure the title and branding for your linesheet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Header Title
                </label>
                <Input
                  value={config.headerTitle}
                  onChange={(e) => setConfig(prev => ({ ...prev, headerTitle: e.target.value }))}
                  placeholder="e.g., CDLP SS26 MENS"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Subheader
                </label>
                <Input
                  value={config.subheader}
                  onChange={(e) => setConfig(prev => ({ ...prev, subheader: e.target.value }))}
                  placeholder="e.g., MENS"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Season
                </label>
                <Input
                  value={config.season}
                  onChange={(e) => setConfig(prev => ({ ...prev, season: e.target.value }))}
                  placeholder="e.g., SS26"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Configuration</CardTitle>
              <CardDescription>
                Set currency and price source preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Currency
                </label>
                <select 
                  value={config.currency}
                  onChange={(e) => setConfig(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="SEK">SEK - Swedish Krona</option>
                  <option value="NOK">NOK - Norwegian Krone</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Price Source
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'price_list', label: 'B2B Price List' },
                    { value: 'metafield', label: 'Metafield' },
                    { value: 'variant_price', label: 'Variant Price' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="priceSource"
                        value={option.value}
                        checked={config.priceSource === option.value}
                        onChange={(e) => setConfig(prev => ({ ...prev, priceSource: e.target.value as 'price_list' | 'metafield' | 'variant_price' }))}
                        className="rounded"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Visibility */}
          <Card>
            <CardHeader>
              <CardTitle>Field Visibility</CardTitle>
              <CardDescription>
                Choose which fields to include in your linesheet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(config.fieldToggles).map(([field, enabled]) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      checked={enabled}
                      onChange={() => updateFieldToggle(field as keyof typeof config.fieldToggles)}
                    />
                    <label className="text-sm font-medium capitalize">
                      {field === 'styleNumber' ? 'Style #' : 
                       field === 'msrp' ? 'M.S.R.P.' : field}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview
              </CardTitle>
              <CardDescription>
                Live preview of your linesheet layout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg p-4 text-xs font-mono">
                {/* Mock preview content */}
                <div className="text-center mb-4 pb-2 border-b">
                  <div className="font-bold text-lg">{config.headerTitle}</div>
                  {config.subheader && (
                    <div className="text-sm text-gray-600">{config.subheader}</div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <div className="font-semibold uppercase">ESSENTIAL COTTON T-SHIRT</div>
                    {config.fieldToggles.styleNumber && (
                      <div>Style #: ECT001</div>
                    )}
                    {config.fieldToggles.season && (
                      <div>Season: {config.season}</div>
                    )}
                    {config.fieldToggles.wholesale && (
                      <div>Wholesale: $12.50</div>
                    )}
                    {config.fieldToggles.msrp && (
                      <div>M.S.R.P.: $25.00</div>
                    )}
                    {config.fieldToggles.sizes && (
                      <div>Sizes: XL - S</div>
                    )}
                    {config.fieldToggles.color && (
                      <div>Color: BLACK</div>
                    )}
                  </div>
                  
                  <div className="border-b pb-2">
                    <div className="font-semibold uppercase">PREMIUM DENIM JACKET</div>
                    {config.fieldToggles.styleNumber && (
                      <div>Style #: PDJ001</div>
                    )}
                    {config.fieldToggles.season && (
                      <div>Season: {config.season}</div>
                    )}
                    {config.fieldToggles.wholesale && (
                      <div>Wholesale: $44.50</div>
                    )}
                    {config.fieldToggles.msrp && (
                      <div>M.S.R.P.: $89.00</div>
                    )}
                    {config.fieldToggles.sizes && (
                      <div>Sizes: L - S</div>
                    )}
                    {config.fieldToggles.color && (
                      <div>Color: DARK NAVY</div>
                    )}
                  </div>
                </div>
                
                <div className="text-right mt-4 pt-2 border-t text-xs">
                  Page 1
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
