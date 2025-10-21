# Environment Variables för Vercel
# Gå till: https://vercel.com/dashboard → Din app → Settings → Environment Variables

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://wstezpddowsmrtsaxqnk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[DIN_SUPABASE_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[DIN_SUPABASE_SERVICE_ROLE_KEY]

# NextAuth Configuration
NEXTAUTH_SECRET=862tenceR5ev5+YXowpEklHWCRUHBstPcNwrzUi5xDY=
NEXTAUTH_URL=https://wholesale-cdlp.vercel.app

# Security
ENCRYPTION_KEY=ba951508521bddbd79dbfaf35f3e484
MFA_ISSUER=CDLP Linesheet

# Admin
ADMIN_EMAIL=axel@cdlp.com

# Instruktioner:
# 1. Gå till Supabase Dashboard → Settings → API
# 2. Kopiera "Project URL" till NEXT_PUBLIC_SUPABASE_URL
# 3. Kopiera "anon public" key till NEXT_PUBLIC_SUPABASE_ANON_KEY
# 4. Kopiera "service_role" key till SUPABASE_SERVICE_ROLE_KEY
# 5. Lägg till alla variabler i Vercel för "All Environments"
