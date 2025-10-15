'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getShopifyOAuthUrl } from '@/lib/shopify'

export default function ShopifyLogin() {
  const [shopDomain, setShopDomain] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!shopDomain) return

    setIsLoading(true)

    try {
      // Clean up shop domain input
      let shop = shopDomain.trim().toLowerCase()
      if (shop.includes('.myshopify.com')) {
        shop = shop.replace('.myshopify.com', '')
      }

      // Generate OAuth URL
      const redirectUri = `${window.location.origin}/auth/callback`
      const authUrl = getShopifyOAuthUrl(shop, redirectUri)

      // Redirect to Shopify OAuth
      window.location.href = authUrl
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">CDLP Linesheet Generator</CardTitle>
          <CardDescription>
            Connect your Shopify store to generate professional wholesale linesheets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="shop" className="text-sm font-medium">
              Shopify Store Domain
            </label>
            <div className="flex space-x-2">
              <Input
                id="shop"
                type="text"
                placeholder="your-store-name"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground self-center">
                .myshopify.com
              </span>
            </div>
          </div>
          
          <Button 
            onClick={handleLogin}
            disabled={!shopDomain || isLoading}
            className="w-full"
          >
            {isLoading ? 'Connecting...' : 'Connect Store'}
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            <p>This will redirect you to Shopify to authorize the app.</p>
            <p>You&apos;ll be redirected back here after authorization.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
