# 🔧 Step-by-Step Shopify Custom App Configuration

## The Problem
OAuth error: "The redirect_uri and application url must have matching hosts"

This means the URLs in your Custom App configuration don't match the OAuth request.

## Step-by-Step Solution

### Step 1: Go to Shopify Admin
1. Go to: `https://cdlpstore.myshopify.com/admin`
2. Login with your admin credentials

### Step 2: Navigate to Custom App
1. Click **"Apps"** in the left sidebar
2. Click **"App and sales channel settings"**
3. Click **"Develop apps"**
4. Find your custom app and click on it

### Step 3: Look for URL Configuration
In your custom app, look for these sections (try each one):

#### Option A: "App setup" Tab
- Look for a tab called **"App setup"** at the top
- This should have URL configuration fields

#### Option B: "Configuration" Tab
- Look for a tab called **"Configuration"**
- This should have App URL and redirect URL settings

#### Option C: "App URLs" Section
- Look for a section called **"App URLs"** or **"URLs"**
- This should be in the main app settings

#### Option D: Main App Settings
- Look at the main app page (not in tabs)
- Look for fields like "App URL" or "Redirect URL"

### Step 4: What You Should See
In the correct section, you should see fields like:

**App URL:**
```
[Input field for App URL]
```

**Allowed redirection URL(s):**
```
[Input field for redirect URLs]
```

### Step 5: Set the Correct URLs
If you find the URL configuration, set these exact values:

**App URL:**
```
https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/app
```

**Allowed redirection URL(s):**
```
https://wholesale-cdlp-git-main-cdlps-projects.vercel.app/auth/callback
```

### Step 6: Save and Test
1. Click **"Save"** at the bottom
2. Try the OAuth URL again

## If You Can't Find URL Configuration

### Take a Screenshot
1. Take a screenshot of your Custom App interface
2. Show me all the tabs/sections available
3. I can guide you to the exact location

### Alternative: Check App Installation
1. Go to **"Apps"** → **"App and sales channel settings"**
2. Look for your app in the **"Installed apps"** section
3. Click on it and look for URL settings

### Common Locations to Check:
- **Apps** → **App and sales channel settings** → **Develop apps** → **[Your App]** → **App setup**
- **Apps** → **App and sales channel settings** → **Develop apps** → **[Your App]** → **Configuration**
- **Apps** → **App and sales channel settings** → **Develop apps** → **[Your App]** → **URLs**
- **Apps** → **App and sales channel settings** → **Develop apps** → **[Your App]** → **Setup**

## What to Look For
The URL configuration section should have:
- ✅ App URL field
- ✅ Redirect URL field
- ✅ Save button
- ✅ Not just scopes (that's Admin API integration)

## Expected Result
After setting the correct URLs:
- ✅ OAuth authorization page loads without errors
- ✅ "Install app" button works
- ✅ Redirects back to your app after authorization
- ✅ Shop data saved in database
- ✅ Dashboard accessible with product data
