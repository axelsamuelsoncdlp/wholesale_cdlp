import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser(email: string, password: string) {
  try {
    console.log('🎯 Creating admin user...')

    // Create user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message)
      return
    }

    if (!authData.user) {
      console.error('❌ No user data returned')
      return
    }

    console.log('✅ Auth user created:', authData.user.id)

    // Create profile with admin role
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        role: 'ADMIN',
        is_approved: true
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message)
      return
    }

    console.log('✅ Admin profile created successfully!')
    console.log(`📧 Email: ${email}`)
    console.log(`👑 Role: ADMIN`)
    console.log(`✅ Approved: true`)
    console.log(`🆔 User ID: ${authData.user.id}`)
    console.log('\n🔐 Login credentials:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('Usage: npx tsx scripts/simple-create-admin.ts <email> <password>')
  process.exit(1)
}

createAdminUser(email, password)
  .then(() => {
    console.log('\n✅ Process completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })
