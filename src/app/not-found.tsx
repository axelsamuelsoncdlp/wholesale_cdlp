import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="mb-8">
          <h1 className="text-6xl font-light text-muted-foreground mb-4">404</h1>
          <h2 className="text-2xl font-medium text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
          >
            Go Home
          </Link>
          
          <div className="text-sm text-muted-foreground">
            <p>This is a Shopify embedded app.</p>
            <p>Make sure you're accessing it from the correct URL.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
