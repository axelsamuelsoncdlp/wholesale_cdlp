import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function approveUser(email: string) {
  try {
    console.log(`🎯 Approving user: ${email}`)

    // First, find the user in auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message)
      return
    }

    const user = authUsers.users.find(u => u.email === email)
    
    if (!user) {
      console.error(`❌ User ${email} not found in auth.users`)
      return
    }

    console.log(`✅ Found user in auth.users: ${user.id}`)

    // Update the profile to approve the user and make them admin
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_approved: true,
        role: 'ADMIN'
      })
      .eq('id', user.id)
      .select()
      .single()

    if (profileError) {
      console.error('❌ Error updating profile:', profileError.message)
      return
    }

    console.log('✅ User approved and made admin successfully!')
    console.log(`📧 Email: ${email}`)
    console.log(`👑 Role: ADMIN`)
    console.log(`✅ Approved: true`)
    console.log(`🆔 User ID: ${user.id}`)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

const email = process.argv[2]

if (!email) {
  console.error('Usage: npx tsx scripts/approve-user.ts <email>')
  process.exit(1)
}

approveUser(email)
  .then(() => {
    console.log('\n✅ Process completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })
