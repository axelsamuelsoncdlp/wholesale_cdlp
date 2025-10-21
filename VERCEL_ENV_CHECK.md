# Vercel Environment Variables Checklist

## Required Environment Variables

Kontrollera att följande variabler finns i Vercel:

### 1. Supabase Configuration
- [✓] `NEXT_PUBLIC_SUPABASE_URL` = `https://wstezpddowsmrtsaxqnk.supabase.co`
- [✓] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzdGV6cGRkb3dzbXJ0c2F4cW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MDM1ODgsImV4cCI6MjA3NjQ3OTU4OH0.wigYMA81Z5sPdyGfl6DBQheZgn9xUqRDiuR1OqjX1nk`
- [✓] `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzdGV6cGRkb3dzbXJ0c2F4cW5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDkwMzU4OCwiZXhwIjoyMDc2NDc5NTg4fQ.2oyCU1aklWEo82FU5Y455L8Tyo2p3cD5CKv73ctTz0o`

### 2. NextAuth Configuration
- [ ] `NEXTAUTH_URL` = `https://wholesale-cdlp.vercel.app`
- [ ] `NEXTAUTH_SECRET` = (generera ny med: `openssl rand -base64 32`)

### 3. Security Configuration
- [ ] `ENCRYPTION_KEY` = `ba951508521bddbd79dbfaf35f3e484`
- [ ] `MFA_ISSUER` = `CDLP Linesheet`

### 4. Shopify Configuration (om används)
- [ ] `SHOPIFY_API_KEY`
- [ ] `SHOPIFY_API_SECRET`
- [ ] `SHOPIFY_SCOPES`

### 5. Admin Configuration
- [ ] `ADMIN_EMAIL` = `axel@cdlp.com`

## Debugging Steps

1. Gå till https://wholesale-cdlp.vercel.app/api/test-db för att testa databasanslutningen
2. Kontrollera Vercel logs för exakta felmeddelanden
3. Verifiera att NEXTAUTH_SECRET är satt (detta är kritiskt!)

## Nästa steg om 500-fel kvarstår:

Kör följande kommando för att generera ny NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

Lägg till i Vercel och gör en redeploy.

