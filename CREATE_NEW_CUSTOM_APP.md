# 🔧 Create New Custom App with Correct Configuration

## The Problem
Our current Custom App has URL configuration issues that are hard to locate and fix.

## Solution: Create a New Custom App

Since finding the URL configuration in the existing Custom App is difficult, let's create a new one with the correct settings from the start.

### Step 1: Create New Custom App
1. Go to: `https://cdlpstore.myshopify.com/admin`
2. Navigate to: **Apps** → **App and sales channel settings** → **Develop apps**
3. Click **"Create an app"**
4. Name it: **"CDLP Linesheet Generator"**

### Step 2: Configure App Setup
In the **App setup** tab (should be available in new apps):

**App URL:**
```
https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/app
```

**Allowed redirection URL(s):**
```
https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/auth/callback
```

### Step 3: Configure Admin API Scopes
In the **Admin API integration** tab:
- Select: `read_products`
- Select: `read_product_listings`

### Step 4: Get New API Credentials
After saving, you'll get:
- **API key** (Client ID)
- **API secret key** (Client Secret)
- **Admin API access token**

### Step 5: Update Vercel Environment Variables
Update these in Vercel:
```
SHOPIFY_API_KEY = new_api_key
SHOPIFY_API_SECRET = new_api_secret
SHOPIFY_ACCESS_TOKEN = new_admin_api_token
```

### Step 6: Test OAuth
Use the new API key in OAuth URL:
```
https://cdlpstore.myshopify.com/admin/oauth/authorize?client_id=NEW_API_KEY&scope=read_products%2Cread_product_listings&redirect_uri=https%3A%2F%2Fwholesale-cdlp-git-main-cdlps-projects.vercel.app%2Fauth%2Fcallback
```

## Benefits of New Custom App
- ✅ Clean configuration from start
- ✅ Correct URL settings
- ✅ No legacy configuration issues
- ✅ Fresh API credentials
- ✅ Proper OAuth flow

## Alternative: Fix Existing App
If you prefer to fix the existing app:
1. Find the URL configuration section
2. Set the correct App URL and redirect URLs
3. Save the configuration
4. Test OAuth flow

## Next Steps After OAuth Success
Once OAuth works, we can:
1. ✅ Set up webhooks via GraphQL Admin API
2. ✅ Configure product data sync
3. ✅ Build linesheet generation features
4. ✅ Add preset management

## Webhook Setup (After OAuth)
For Custom Apps, webhooks must be set up via GraphQL Admin API:
- Create webhook subscriptions
- Handle webhook events
- Sync product data
- Update linesheet content

The webhook setup will be much easier once OAuth is working properly!
