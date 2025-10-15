# 🔗 Correct OAuth URL

## Fixed Redirect URI Issue

The problem was that `NEXT_PUBLIC_APP_URL` was not set in Vercel, causing the redirect_uri to be `undefined`.

## Correct OAuth URL

Use this URL to install the app:

```
https://cdlpstore.myshopify.com/admin/oauth/authorize?client_id=6393b08a5dbb1fcb9703cbd476c8f8e1&scope=read_products%2Cread_product_listings&redirect_uri=https%3A//wholesale-cdlp-git-main-cdlps-projects.vercel.app/auth/callback
```

## What Was Fixed

1. **Fallback URL**: Added hardcoded fallback URL in case environment variable is missing
2. **Consistent redirect_uri**: Both auth.ts and callback route now use the same URL
3. **URL encoding**: Proper URL encoding for the redirect_uri parameter

## Environment Variables to Set in Vercel

Make sure these are set in your Vercel project:

```
SHOPIFY_API_KEY=6393b08a5dbb1fcb9703cbd476c8f8e1
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_ACCESS_TOKEN=your_admin_api_token_here
DATABASE_URL=your_supabase_database_url_here
NEXT_PUBLIC_APP_URL=https://wholesale-cdlp-git-main-cdlps-projects.vercel.app
```

## Installation Steps

1. **Deploy the fix** (wait 2-3 minutes)
2. **Use the correct OAuth URL** above
3. **Authorize the app** in Shopify
4. **Complete OAuth flow** and get redirected to dashboard

## What Should Happen

1. ✅ OAuth authorization page loads correctly
2. ✅ "Install app" button works
3. ✅ Redirect to app with proper callback URL
4. ✅ Shop data saved in database
5. ✅ Dashboard accessible with product data

## Troubleshooting

### If still getting redirect_uri error:
1. Clear browser cache
2. Wait for Vercel deployment (2-3 minutes)
3. Use the exact URL provided above
4. Check that Custom App redirect URL matches in Shopify Admin

### Custom App Configuration:
Make sure in Shopify Admin → Apps → App and sales channel settings → Develop apps → Your app → Configuration:

**App URL:**
```
https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/app
```

**Allowed redirection URL(s):**
```
https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/auth/callback
```
