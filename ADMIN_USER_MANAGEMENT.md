# Admin-användare Hantering

## Översikt

Detta dokument beskriver hur du lägger till och hanterar admin-användare i CDLP Linesheet Generator.

## Sätt att lägga till Admin-användare

### 🚀 **Metod 1: Skapa första admin (Rekommenderat för första admin)**

Använd detta script för att skapa den första admin-användaren:

```bash
# TypeScript version (rekommenderat)
npx tsx scripts/create-admin.ts admin@cdlp.com "MySecurePassword123!"

# JavaScript version (alternativ)
node scripts/create-admin.js admin@cdlp.com "MySecurePassword123!"
```

**Exempel:**
```bash
npx tsx scripts/create-admin.ts admin@cdlp.com "CDLP2024Secure!"
```

### 👥 **Metod 2: Via Admin Panel (För ytterligare admins)**

1. **Skapa vanlig användare:**
   - Användaren registrerar sig med @cdlp.com email
   - Admin godkänner användaren via `/admin/users`

2. **Uppgradera till Admin:**
   - Gå till `/admin/users` 
   - Hitta användaren i listan
   - Klicka på "Change Role" 
   - Välj "ADMIN" istället för "STANDARD"

### 🛠️ **Metod 3: Direkt via Database**

För avancerade användare som vill skapa admin-användare direkt via databasen:

```sql
-- Hasha lösenordet först (använd bcrypt med salt rounds 12)
-- Sedan kör:
INSERT INTO users (id, email, "hashedPassword", role, "isActive", "mfaEnabled", "createdAt", "updatedAt")
VALUES (
  'cuid_generated_id',
  'admin@cdlp.com',
  'hashed_password_here',
  'ADMIN',
  true,
  false,
  NOW(),
  NOW()
);
```

## Admin-funktioner

### 🔐 **Admin-behörigheter:**
- ✅ Godkänna/avslå nya användare
- ✅ Ändra användarroll (STANDARD ↔ ADMIN)
- ✅ Aktivera/inaktivera användare
- ✅ Visa audit logs
- ✅ Hantera alla systeminställningar

### 📊 **Admin Panel:**
- **URL:** `/admin/users`
- **Funktioner:**
  - Se alla användare
  - Godkänna väntande registreringar
  - Ändra användarroll
  - Aktivera/inaktivera konton
  - Visa användarstatistik

## Säkerhetsrekommendationer

### 🔒 **För Admin-användare:**

1. **Starkt lösenord:**
   - Minst 12 tecken
   - Blandning av stora/små bokstäver, siffror, specialtecken
   - Unikt för detta system

2. **MFA (Two-Factor Authentication):**
   - Aktivera MFA omedelbart efter första inloggningen
   - Använd autentiseringsapp (Google Authenticator, Authy, etc.)

3. **Säker inloggning:**
   - Logga aldrig in från publika nätverk
   - Använd VPN vid behov
   - Logga ut när du är klar

### 🛡️ **System-säkerhet:**

1. **Begränsa admin-antal:**
   - Skapa bara så många admins som nödvändigt
   - Regelbunden granskning av admin-behörigheter

2. **Audit logging:**
   - Alla admin-åtgärder loggas automatiskt
   - Granska regelbundet `/admin/audit` för misstänkt aktivitet

3. **Backup:**
   - Regelbundna säkerhetskopior av användardata
   - Testa återställningsprocedurer

## Felsökning

### ❌ **Admin kan inte logga in:**

1. **Kontrollera:**
   - Är kontot aktivt? (`isActive: true`)
   - Är rollen ADMIN?
   - Fungerar lösenordet?

2. **Lösning:**
   ```bash
   # Kontrollera användarens status
   npx tsx scripts/check-user.ts admin@cdlp.com
   ```

### ❌ **Script fungerar inte:**

1. **Kontrollera:**
   - Är DATABASE_URL satt korrekt?
   - Fungerar Prisma-anslutningen?
   - Har du rätt behörigheter?

2. **Lösning:**
   ```bash
   # Testa databasanslutning
   npx prisma db push
   ```

### ❌ **Kan inte komma åt admin panel:**

1. **Kontrollera:**
   - Är du inloggad?
   - Har du ADMIN-roll?
   - Fungerar sessionen?

2. **Lösning:**
   - Logga ut och in igen
   - Kontrollera att `isActive: true` i databasen

## Exempel på Admin-workflow

### 🎯 **Skapa första admin:**

```bash
# 1. Skapa admin-användare
npx tsx scripts/create-admin.ts admin@cdlp.com "CDLP2024Secure!"

# 2. Logga in på applikationen
# 3. Gå till /admin/users
# 4. Sätt upp MFA
# 5. Godkänn andra användare
```

### 🎯 **Lägg till ytterligare admin:**

1. **Användaren registrerar sig** med @cdlp.com email
2. **Admin godkänner** via `/admin/users`
3. **Admin ändrar roll** från STANDARD till ADMIN
4. **Ny admin sätter upp MFA**

## Support

För frågor eller problem:
- **Tekniska problem:** Kontakta systemadministratör
- **Säkerhetsproblem:** Kontakta säkerhetsteamet omedelbart
- **Användarhantering:** Se `/admin/users` för alla alternativ
