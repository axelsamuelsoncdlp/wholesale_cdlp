#!/usr/bin/env node

/**
 * Script för att skapa första admin-användaren
 * Kör detta script för att skapa den första admin-användaren
 * 
 * Användning:
 * node scripts/create-admin.js admin@cdlp.com "StrongPassword123!"
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser(email: string, password: string) {
  try {
    console.log('🚀 Skapar admin-användare...')
    
    // Validera email-domän
    if (!email.endsWith('@cdlp.com')) {
      throw new Error('❌ Endast @cdlp.com email-adresser är tillåtna')
    }
    
    // Kontrollera om användaren redan finns
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      console.log('⚠️  Användaren finns redan:', existingUser.email)
      console.log('📊 Roll:', existingUser.role)
      console.log('✅ Aktiv:', existingUser.isActive)
      return
    }
    
    // Hasha lösenordet
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    // Skapa admin-användare
    const adminUser = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        role: 'ADMIN',
        isActive: true, // Aktivera direkt för admin
        mfaEnabled: false // Admin kan sätta upp MFA senare
      }
    })
    
    console.log('✅ Admin-användare skapad framgångsrikt!')
    console.log('📧 Email:', adminUser.email)
    console.log('👑 Roll:', adminUser.role)
    console.log('✅ Aktiv:', adminUser.isActive)
    console.log('🆔 User ID:', adminUser.id)
    console.log('')
    console.log('🔐 Du kan nu logga in med:')
    console.log('   Email:', email)
    console.log('   Lösenord:', password)
    console.log('')
    console.log('⚠️  Glöm inte att sätta upp MFA efter inloggning!')
    
  } catch (error) {
    console.error('❌ Fel vid skapande av admin-användare:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Hämta argument från kommandoraden
const args = process.argv.slice(2)

if (args.length !== 2) {
  console.log('❌ Felaktigt antal argument')
  console.log('')
  console.log('Användning:')
  console.log('  node scripts/create-admin.js <email> <password>')
  console.log('')
  console.log('Exempel:')
  console.log('  node scripts/create-admin.js admin@cdlp.com "MySecurePassword123!"')
  process.exit(1)
}

const [email, password] = args

// Validera lösenord
if (password.length < 8) {
  console.log('❌ Lösenordet måste vara minst 8 tecken långt')
  process.exit(1)
}

createAdminUser(email, password)
