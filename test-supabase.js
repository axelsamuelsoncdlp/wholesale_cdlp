import { createClient } from '@supabase/supabase-js'

// Test Supabase connection
async function testSupabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    console.log('Required:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL')
    console.log('- SUPABASE_SERVICE_ROLE_KEY')
    return
  }

  console.log('🔗 Testing Supabase connection...')
  console.log(`URL: ${supabaseUrl}`)

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Test connection by querying a simple table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return
    }

    console.log('✅ Supabase connection successful!')
    console.log('📊 Database is accessible')

  } catch (err) {
    console.error('❌ Connection test failed:', err)
  }
}

testSupabaseConnection()
