# Database Setup Instructions

## Problem
The `SUPABASE_URL` environment variable contains the API URL (`https://...`), not the PostgreSQL connection string.

## Solution
You need to set the `DATABASE_URL` environment variable in Vercel with the PostgreSQL connection string from Supabase.

## Steps to Fix:

### 1. Get PostgreSQL Connection String from Supabase
1. Go to your Supabase dashboard
2. Go to **Settings** → **Database**
3. Scroll down to **Connection string**
4. Copy the **URI** connection string (it should look like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

### 2. Set DATABASE_URL in Vercel
1. Go to your Vercel dashboard
2. Go to your project
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name**: `DATABASE_URL`
   - **Value**: The PostgreSQL connection string from step 1
   - **Environment**: Production, Preview, Development (select all)
5. Click **Save**

### 3. Redeploy
After setting the environment variable, trigger a new deployment:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment

## Alternative: Use Supabase Database URL
If you have a separate `SUPABASE_DATABASE_URL` environment variable with the PostgreSQL connection string, you can use that instead by updating `src/lib/db.ts` to use it as the primary source.

## Verification
After the redeploy, test the database connection:
- Go to: `https://wholesale-cdlp.vercel.app/api/test-db`
- You should see `"success": true` and database information
