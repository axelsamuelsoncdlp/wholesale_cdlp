import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Required:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Email domain validation
function validateEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return domain === 'cdlp.com'
}

async function createAdminUser(email: string, passwordPlain: string) {
  if (!validateEmailDomain(email)) {
    console.error('❌ Fel: Endast @cdlp.com email-adresser är tillåtna.')
    return
  }

  // Kontrollera om användaren redan finns
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    console.error(`❌ Fel: Användare med email ${email} finns redan.`)
    return
  }

  const hashedPassword = await bcrypt.hash(passwordPlain, 12)

  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email,
      hashed_password: hashedPassword,
      role: 'ADMIN',
      is_active: true, // Admin-konton är aktiva direkt
      mfa_enabled: false, // MFA måste sättas upp efter första inloggning
    })
    .select()
    .single()

  if (error) {
    console.error('❌ Fel vid skapande av admin-användare:', error.message)
    return
  }

  console.log('✅ Admin-användare skapad framgångsrikt!')
  console.log(`📧 Email: ${user.email}`)
  console.log(`👑 Roll: ${user.role}`)
  console.log(`✅ Aktiv: ${user.is_active}`)
  console.log(`🆔 User ID: ${user.id}`)
  console.log('\n🔐 Du kan nu logga in med:')
  console.log(`   Email: ${email}`)
  console.log(`   Lösenord: ${passwordPlain}`)
  console.log('\n⚠️  Glöm inte att sätta upp MFA efter inloggning!')
}

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('Användning: npx tsx scripts/create-admin.ts <email> <password>')
  process.exit(1)
}

createAdminUser(email, password)
  .catch((e) => {
    console.error('❌ Fel vid skapande av admin-användare: ', e)
    process.exit(1)
  })
