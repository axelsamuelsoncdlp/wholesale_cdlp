# 🔧 OAuth Setup Guide - Fix Redirect URI Error

## Problem
```
Oauth error invalid_request: The redirect_uri and application url must have matching hosts
```

## Solution

### 1. Find Your Vercel App URL
Your deployed app URL is likely:
```
https://wholesale-cdlp-git-main-cdlps-projects.vercel.app
```

### 2. Configure Shopify Partners Dashboard

**Go to:** [partners.shopify.com](https://partners.shopify.com)
1. Select your app
2. Go to "App setup" tab
3. Configure these URLs:

```
App URL: 
https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/app

Allowed redirection URL(s):
https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/auth/callback
```

### 3. Update Vercel Environment Variables

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

Add/Update:
```
NEXT_PUBLIC_APP_URL = https://wholesale-cdlp-git-main-cdlps-projects.vercel.app
```

### 4. Test OAuth Flow

1. Go to your app: `https://wholesale-cdlp-git-main-cdlps-projects.vercel.app`
2. Click "Access CDLP Store Linesheet Generator"
3. Should redirect to Shopify OAuth successfully

## Troubleshooting

### If you get different URLs:
1. Check Vercel dashboard for your actual domain
2. Update both Shopify Partners Dashboard and Vercel environment variables
3. Make sure URLs match exactly (including https://)

### Common Issues:
- Missing `https://` prefix
- Trailing slashes
- Different subdomains
- Wrong callback path

## Security Note
Make sure to use the production domain, not localhost or development URLs in production.
