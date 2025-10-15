# Shopify Linesheet App - Deployment Guide

## Prerequisites

1. **Shopify Partners Account**: Create an account at [partners.shopify.com](https://partners.shopify.com)
2. **Supabase Account**: Create a project at [supabase.com](https://supabase.com)
3. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## Step 1: Setup Database (Supabase)

1. Create a new Supabase project
2. Go to Settings > Database
3. Copy the connection string (URI format)
4. Run the following in your project directory:
   ```bash
   npx prisma db push
   ```

## Step 2: Create Shopify App

1. Go to [Shopify Partners Dashboard](https://partners.shopify.com)
2. Click "Create app" > "Create app manually"
3. Fill in app details:
   - App name: "CDLP Linesheet Generator"
   - App URL: `https://your-app.vercel.app` (will update after deployment)
   - Allowed redirection URLs: `https://your-app.vercel.app/auth/callback`
4. Copy the API key and secret

## Step 3: Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "New Project" and import your repository
4. Configure environment variables:
   ```
   SHOPIFY_API_KEY=your_api_key_here
   SHOPIFY_API_SECRET=your_api_secret_here
   SHOPIFY_APP_URL=https://your-app.vercel.app
   SHOPIFY_SCOPES=read_products,read_price_rules,read_product_listings
   DATABASE_URL=postgresql://username:password@host:port/database
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
5. Deploy the project

## Step 4: Update Shopify App Configuration

1. Go back to Shopify Partners Dashboard
2. Update your app's URLs to use the Vercel domain:
   - App URL: `https://your-app.vercel.app`
   - Allowed redirection URLs: `https://your-app.vercel.app/auth/callback`
3. Save the changes

## Step 5: Test the App

1. Install the app on a development store
2. Test the OAuth flow
3. Create a linesheet and generate a PDF
4. Verify the embedded app works in Shopify Admin

## Step 6: Production Setup

1. Create a production Shopify app (separate from development)
2. Update environment variables with production credentials
3. Deploy to production Vercel project
4. Update production app URLs in Shopify Partners

## Troubleshooting

### Build Issues
- Ensure all dependencies are installed with `npm install --legacy-peer-deps`
- Check that all TypeScript errors are resolved
- Verify Prisma schema is correct

### OAuth Issues
- Verify HMAC validation is working
- Check that redirect URLs match exactly
- Ensure scopes are correct

### PDF Generation Issues
- Check that @react-pdf/renderer is properly configured
- Verify fonts are loading correctly
- Test with mock data first

### Database Issues
- Run `npx prisma generate` after schema changes
- Verify DATABASE_URL is correct
- Check Supabase connection settings

## Development vs Production

### Development
- Use development Shopify app
- Use Supabase development database
- Use Vercel preview deployments

### Production
- Use production Shopify app
- Use Supabase production database
- Use Vercel production deployment
- Enable proper error monitoring
- Set up proper logging

## Security Considerations

- Never commit API keys or secrets
- Use environment variables for all sensitive data
- Implement proper error handling
- Validate all user inputs
- Use HTTPS in production
- Implement rate limiting for API endpoints

## Performance Optimization

- Enable Vercel Edge Functions for better performance
- Implement caching for Shopify API calls
- Optimize PDF generation for large product catalogs
- Use CDN for static assets
- Implement proper loading states

## Monitoring

- Set up error tracking (Sentry, LogRocket)
- Monitor API usage and performance
- Track PDF generation success rates
- Monitor database performance
- Set up uptime monitoring
