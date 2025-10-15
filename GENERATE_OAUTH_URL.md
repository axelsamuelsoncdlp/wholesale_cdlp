# 🔗 Generate OAuth URL for Installation

## Manual OAuth URL Generation

Since the app is already installed in Shopify Admin, we need to trigger the OAuth flow to save the shop data in our database.

### Option 1: Use the App Installation URL

Go to your browser and visit this URL (replace `YOUR_API_KEY` with your actual API key):

```
https://cdlpstore.myshopify.com/admin/oauth/authorize?client_id=YOUR_API_KEY&scope=read_products,read_product_listings&redirect_uri=https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/auth/callback
```

### Option 2: Use the App Interface

1. Go to: `https://wholesale-cdlp-git-main-cdlps-projects.vercel.app`
2. Click "Access CDLP Store Linesheet Generator"
3. This will redirect to Shopify OAuth

### What Happens During OAuth:

1. **Shopify Authorization Page** - You'll see a page asking to authorize the app
2. **Authorization** - Click "Install app" to grant permissions
3. **Callback** - Shopify redirects back to our app with authorization code
4. **Token Exchange** - App exchanges code for access token
5. **Database Save** - Shop and token are saved to Supabase database
6. **Dashboard Redirect** - You're redirected to the app dashboard

### Required Scopes:

- `read_products` - To fetch product data
- `read_product_listings` - To access product listings

### After OAuth Success:

- ✅ Shop data saved in database
- ✅ Access token stored securely
- ✅ App accessible through dashboard
- ✅ Product data can be fetched

## Troubleshooting:

### If OAuth fails:
1. Check that `SHOPIFY_API_KEY` is set in Vercel
2. Verify redirect URL matches: `https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/auth/callback`
3. Ensure app is installed in Shopify Admin
4. Check that scopes are correct

### If database save fails:
1. Verify `DATABASE_URL` is set in Vercel
2. Check Supabase database connection
3. Ensure Prisma schema is deployed

## Environment Variables Required:

```
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_ACCESS_TOKEN=your_admin_api_token_here
DATABASE_URL=your_supabase_database_url_here
NEXT_PUBLIC_APP_URL=https://wholesale-cdlp-git-main-cdlps-projects.vercel.app
```
