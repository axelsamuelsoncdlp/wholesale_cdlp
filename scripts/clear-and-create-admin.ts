import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function clearAllUsersAndCreateAdmin(email: string, password: string) {
  try {
    console.log('🧹 Clearing all users and profiles...')

    // Get all users
    const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers()
    console.log(`Found ${allUsers.users.length} existing users`)

    // Delete all profiles first
    const { error: deleteProfilesError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all profiles

    if (deleteProfilesError) {
      console.error('❌ Error deleting profiles:', deleteProfilesError.message)
    } else {
      console.log('✅ All profiles deleted')
    }

    // Delete all auth users
    for (const user of allUsers.users) {
      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      if (deleteUserError) {
        console.error(`❌ Error deleting user ${user.email}:`, deleteUserError.message)
      } else {
        console.log(`✅ Deleted user: ${user.email}`)
      }
    }

    console.log('\n🎯 Creating new admin user...')

    // Create new admin user
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

    // Create admin profile
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

    console.log('\n🎉 Admin user created successfully!')
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
  console.error('Usage: npx tsx scripts/clear-and-create-admin.ts <email> <password>')
  process.exit(1)
}

clearAllUsersAndCreateAdmin(email, password)
  .then(() => {
    console.log('\n✅ Process completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })
