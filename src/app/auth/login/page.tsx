import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Shield, Lock } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CDLP Linesheet Generator</span>
          </div>
          <p className="text-muted-foreground">
            Professional wholesale linesheet generator for Shopify stores
          </p>
        </div>

        {/* Security Notice */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-800 dark:text-blue-200 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Secure Access Required
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              This application handles sensitive product data and requires secure authentication.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Shopify Store Access</CardTitle>
            <CardDescription>
              Enter your Shopify store domain to access the linesheet generator
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="shop" className="text-sm font-medium">
                  Store Domain
                </label>
                <div className="flex space-x-2">
                  <Input
                    id="shop"
                    type="text"
                    placeholder="your-store-name"
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground self-center">
                    .myshopify.com
                  </span>
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                Access Linesheet Generator
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              <p>This will redirect you to Shopify for secure authentication.</p>
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Security Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span>HMAC-validated requests</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Rate limiting protection</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Comprehensive audit logging</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Data encryption at rest</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Enterprise-grade security for sensitive product data</p>
          <p>© 2024 CDLP Linesheet Generator</p>
        </div>
      </div>
    </div>
  )
}
