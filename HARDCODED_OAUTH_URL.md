# 🔗 Hardcoded OAuth URL for Testing

## The Problem
Even though we have fallback URLs in the code, `undefined` is still appearing in the redirect_uri. This suggests the environment variable isn't being loaded properly.

## Solution: Use Hardcoded URL

Since the fallback should work, let's use a completely hardcoded OAuth URL:

```
https://cdlpstore.myshopify.com/admin/oauth/authorize?client_id=6393b08a5dbb1fcb9703cbd476c8f8e1&scope=read_products%2Cread_product_listings&redirect_uri=https%3A%2F%2Fwholesale-cdlp-git-main-cdlps-projects.vercel.app%2Fauth%2Fcallback
```

## Debug Steps

### 1. Check Environment Variables
Visit: `https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/debug`

This will show:
- What `NEXT_PUBLIC_APP_URL` is set to
- What the fallback URL is
- What the generated OAuth URL would be

### 2. Try Hardcoded OAuth URL
Use the URL above directly - it should work regardless of environment variables.

### 3. Check Vercel Environment Variables
In Vercel Dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Verify `NEXT_PUBLIC_APP_URL` is set to:
   ```
   https://wholesale-cdlp-git-main-cdlps-projects.vercel.app
   ```

### 4. Redeploy if Needed
If environment variables are wrong:
1. Update them in Vercel
2. Trigger a new deployment
3. Wait 2-3 minutes

## Why This Happens

### Environment Variable Loading:
- `NEXT_PUBLIC_APP_URL` needs to be set in Vercel
- Must be available at build time
- Client-side code can access it
- Server-side code can access it

### Fallback Logic:
```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wholesale-cdlp-git-main-cdlps-projects.vercel.app'
```

This should work, but if it doesn't, the hardcoded URL will.

## Test Order

1. **Try hardcoded OAuth URL** (should work immediately)
2. **Check debug page** (see what environment variables are loaded)
3. **Fix Vercel environment variables** (if needed)
4. **Test app-generated OAuth URL** (after fix)

## Expected Result

After using the hardcoded URL:
- ✅ OAuth authorization page loads
- ✅ "Install app" button works
- ✅ Redirects back to app with authorization code
- ✅ Shop data saved in database
- ✅ Dashboard accessible
