# 🔒 Secure Installation Guide

## Security Update

The application now requires proper Shopify authentication. No one can access the app without being authenticated through Shopify Admin.

## How to Install the App Securely

### 1. Access Through Shopify Admin

**Only users with access to your Shopify store can install the app:**

1. **Go to your Shopify Admin:** `https://cdlpstore.myshopify.com/admin`
2. **Navigate to:** Apps → App and sales channel settings → Develop apps
3. **Find your custom app** and click "Install app"
4. **Authorize the app** with the required scopes:
   - `read_products`
   - `read_product_listings`

### 2. What Happens During Installation

1. **OAuth Flow:** Shopify redirects to our app with authorization code
2. **Token Exchange:** App exchanges code for access token
3. **Database Storage:** Shop and token are saved securely
4. **Redirect to App:** User is redirected to the dashboard

### 3. Security Features

✅ **Shopify OAuth Required:** Only authenticated Shopify users can access
✅ **HMAC Validation:** All requests are validated for security
✅ **Access Token Storage:** Encrypted tokens in database
✅ **Audit Logging:** All access attempts are logged
✅ **Shop Validation:** Only authorized shops can access

### 4. User Access Control

**Who can access the app:**
- ✅ Users with access to your Shopify Admin
- ✅ Users who can install apps in your store
- ✅ Users with appropriate permissions

**Who cannot access:**
- ❌ Random internet users
- ❌ Users without Shopify store access
- ❌ Unauthorized shops

### 5. Installation URL

**For CDLP Store:**
```
https://cdlpstore.myshopify.com/admin/oauth/authorize?client_id=YOUR_API_KEY&scope=read_products,read_product_listings&redirect_uri=https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/auth/callback
```

**Or use the app installation flow:**
1. Go to: `https://wholesale-cdlp-git-main-cdlps-projects.vercel.app`
2. Click "Access CDLP Store Linesheet Generator"
3. Complete Shopify OAuth flow

### 6. Environment Variables Required

Make sure these are set in Vercel:
```
SHOPIFY_API_KEY = your_api_key
SHOPIFY_API_SECRET = your_api_secret  
SHOPIFY_ACCESS_TOKEN = your_admin_api_token
NEXT_PUBLIC_APP_URL = https://wholesale-cdlp-git-main-cdlps-projects.vercel.app
DATABASE_URL = your_supabase_database_url
```

### 7. Database Setup

The app requires a Supabase database with the `Shop` table:

```sql
CREATE TABLE "Shop" (
  "id" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Shop_domain_key" ON "Shop"("domain");
```

## Testing Security

### Test 1: Unauthorized Access
- Try accessing `https://wholesale-cdlp-git-main-cdlps-projects.vercel.app` directly
- Should redirect to login page
- Should not show any product data

### Test 2: Authorized Access
- Install app through Shopify Admin
- Should redirect to dashboard after OAuth
- Should show product data and allow linesheet creation

## Troubleshooting

### If OAuth fails:
1. Check API credentials in Vercel
2. Verify redirect URL in Custom App settings
3. Ensure scopes are correct
4. Check database connection

### If still accessible without login:
1. Clear browser cache
2. Wait for Vercel deployment (2-3 minutes)
3. Check environment variables are set correctly

## Security Benefits

🔒 **Enterprise-grade security** for sensitive product data
🔒 **Shopify-native authentication** using OAuth 2.0
🔒 **Encrypted token storage** in Supabase database
🔒 **Comprehensive audit logging** for compliance
🔒 **Access control** based on Shopify permissions
