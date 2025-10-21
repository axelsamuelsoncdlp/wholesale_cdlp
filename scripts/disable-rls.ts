import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function disableRLS() {
  try {
    console.log('🔧 Disabling RLS for profiles table...')
    
    // Use the SQL editor approach - we'll need to run this manually in Supabase dashboard
    console.log('Please run this SQL in Supabase SQL Editor:')
    console.log('ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;')
    console.log('')
    console.log('Or use the Supabase dashboard to disable RLS for the profiles table.')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

disableRLS()
  .then(() => {
    console.log('✅ Instructions provided!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })
