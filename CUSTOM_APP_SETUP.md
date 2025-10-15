# 🔧 Custom App Setup Guide

## Custom App vs Partners App

### ✅ You have: Custom App (Created in Shopify Admin)
- Simpler setup
- No Partners Dashboard needed
- Direct OAuth with your store

### ❌ Not needed: Partners App
- For distributing to other stores
- More complex setup

## Custom App Configuration

### 1. Find Your Custom App Credentials

**Go to:** Your Shopify Admin → Apps → App and sales channel settings → Develop apps

1. Find your custom app
2. Click on it
3. Go to "Configuration" tab
4. Copy these values:

```
API key: your_api_key_here
API secret key: your_api_secret_here
```

### 2. Configure App URLs in Custom App

In your custom app configuration, set:

```
App URL: https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/app

Allowed redirection URL(s):
https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/auth/callback
```

### 3. Update Vercel Environment Variables

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

Set these values:
```
SHOPIFY_API_KEY = your_api_key_here
SHOPIFY_API_SECRET = your_api_secret_here
NEXT_PUBLIC_APP_URL = https://wholesale-cdlp-git-main-cdlps-projects.vercel.app
```

### 4. Test OAuth Flow

1. Go to: `https://wholesale-cdlp-git-main-cdlps-projects.vercel.app`
2. Click "Access CDLP Store Linesheet Generator"
3. Should redirect to Shopify OAuth successfully

## Required Scopes

Make sure your custom app has these scopes:
- `read_products`
- `read_product_listings`

## Benefits of Custom App

✅ **Simpler setup** - No Partners Dashboard
✅ **Direct access** - Only your store
✅ **Easier maintenance** - Everything in one place
✅ **No approval process** - Works immediately

## Troubleshooting

### If OAuth still fails:
1. Double-check API key and secret in Vercel
2. Verify App URL and redirect URL in custom app
3. Make sure scopes are correct
4. Check that custom app is active

### Common Issues:
- Wrong API credentials
- Missing scopes
- Incorrect redirect URLs
- Custom app not activated
