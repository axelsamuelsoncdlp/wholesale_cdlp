# Environment Variables Setup

## Required Environment Variables

Add these to your Vercel project settings and `.env.local` for development:

```env
# App Configuration
APP_URL=https://wholesale-cdlp-git-main-cdlps-projects.vercel.app
NEXT_PUBLIC_SHOPIFY_API_KEY=6393b08a5dbb1fcb9703cbd476c8f8e1

# Shopify API Credentials (existing)
SHOPIFY_API_KEY=6393b08a5dbb1fcb9703cbd476c8f8e1
SHOPIFY_API_SECRET=your_api_secret_here

# Scopes
SCOPES=read_products,read_product_listings

# Session Configuration
SESSION_COOKIE_NAME=shopify_app_session

# Database (existing)
DATABASE_URL=your_supabase_database_url

# Encryption (existing)
ENCRYPTION_KEY=your_encryption_key
```

## Important Notes

1. **APP_URL** must match exactly with `application_url` in `shopify.app.toml`
2. **NEXT_PUBLIC_SHOPIFY_API_KEY** should be the same as **SHOPIFY_API_KEY**
3. **APP_URL** is used for all redirect URIs to prevent `undefined` issues
4. All URLs must use HTTPS in production

## Vercel Setup

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable listed above
4. Make sure to set them for all environments (Production, Preview, Development)

## Shopify Custom App Configuration

In Shopify Admin → Apps → App and sales channel settings → Develop apps → Your App:

**Application URL:**
```
https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/
```

**Allowed redirection URL(s):**
```
https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/auth/callback
```

These must match exactly with your `APP_URL` environment variable.
