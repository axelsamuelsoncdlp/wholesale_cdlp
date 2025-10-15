export default function DebugPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wholesale-cdlp-git-main-cdlps-projects.vercel.app'
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      
      <div className="space-y-4">
        <div>
          <strong>NEXT_PUBLIC_APP_URL:</strong>
          <pre className="bg-gray-100 p-2 rounded">
            {process.env.NEXT_PUBLIC_APP_URL || 'undefined'}
          </pre>
        </div>
        
        <div>
          <strong>Fallback URL:</strong>
          <pre className="bg-gray-100 p-2 rounded">
            {baseUrl}
          </pre>
        </div>
        
        <div>
          <strong>OAuth URL:</strong>
          <pre className="bg-gray-100 p-2 rounded">
            https://cdlpstore.myshopify.com/admin/oauth/authorize?client_id=6393b08a5dbb1fcb9703cbd476c8f8e1&scope=read_products%2Cread_product_listings&redirect_uri={encodeURIComponent(baseUrl + '/auth/callback')}
          </pre>
        </div>
      </div>
    </div>
  )
}
