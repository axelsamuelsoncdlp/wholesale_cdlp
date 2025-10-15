# 🔧 Shopify Custom App Configuration Fix

## Problem
OAuth error: "The redirect_uri and application url must have matching hosts"

This happens when the URLs configured in your Custom App don't match the OAuth request.

## Solution: Update Custom App Configuration

### Step 1: Go to Shopify Admin
1. Go to: `https://cdlpstore.myshopify.com/admin`
2. Navigate to: **Apps** → **App and sales channel settings** → **Develop apps**
3. Find your custom app and click on it

### Step 2: Update Configuration Tab
In the **Configuration** tab, set these exact values:

**App URL:**
```
https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/app
```

**Allowed redirection URL(s):**
```
https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/auth/callback
```

### Step 3: Save Configuration
Click **Save** at the bottom of the Configuration tab.

### Step 4: Test OAuth Again
After saving, try the OAuth URL again:

```
https://cdlpstore.myshopify.com/admin/oauth/authorize?client_id=6393b08a5dbb1fcb9703cbd476c8f8e1&scope=read_products%2Cread_product_listings&redirect_uri=https%3A%2F%2Fwholesale-cdlp-git-main-cdlps-projects.vercel.app%2Fauth%2Fcallback
```

## Important Notes

### URL Matching Rules:
- The **App URL** must match the domain of your redirect_uri
- Both must use the same protocol (https://)
- Both must use the exact same domain

### Current URLs:
- **App URL:** `https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/app`
- **Redirect URI:** `https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/auth/callback`
- **Domain Match:** ✅ `wholesale-cdlp-git-main-cdlps-projects.vercel.app`

### Common Mistakes:
❌ Wrong protocol (http vs https)
❌ Different subdomains
❌ Extra trailing slashes
❌ Different ports

### Correct Configuration:
✅ Same domain: `wholesale-cdlp-git-main-cdlps-projects.vercel.app`
✅ Same protocol: `https://`
✅ Exact URL match

## Troubleshooting

### If still getting the error:
1. **Clear browser cache** - Old OAuth state might be cached
2. **Check exact URLs** - Copy-paste to avoid typos
3. **Wait a few minutes** - Shopify might need time to update
4. **Try incognito mode** - Avoid cached authentication state

### Alternative: Check Current Configuration
If you're unsure what's currently set:
1. Go to Custom App → Configuration tab
2. Screenshot the current App URL and Redirect URLs
3. Compare with the URLs above

### Verification:
After updating, the OAuth flow should:
1. ✅ Load authorization page without errors
2. ✅ Show "Install app" button
3. ✅ Redirect back to your app after authorization
4. ✅ Save shop data in database
5. ✅ Show dashboard with product data
