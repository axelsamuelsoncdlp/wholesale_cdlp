# Shopify Linesheet App Setup

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Shopify App Configuration
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_APP_URL=https://your-app.vercel.app
SHOPIFY_SCOPES=read_products,read_price_rules,read_product_listings

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Supabase (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NODE_ENV=development
```

## Shopify Partner App Setup

1. Go to [Shopify Partners](https://partners.shopify.com/)
2. Create a new app
3. Set the app URL to your Vercel deployment URL
4. Set the allowed redirection URLs to: `https://your-app.vercel.app/auth/callback`
5. Copy the API key and secret to your environment variables

## Database Setup

1. Create a Supabase project
2. Get the database connection string
3. Add it to your environment variables
4. Run `npx prisma db push` to create the database schema

## Development

```bash
npm run dev
```

## Deployment

1. Deploy to Vercel
2. Update the app URLs in Shopify Partners dashboard
3. Install the app on a development store
