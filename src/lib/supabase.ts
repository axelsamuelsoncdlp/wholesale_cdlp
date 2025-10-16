import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_API_KEY

// For build time, provide fallback values
const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackKey = 'placeholder-key'

export const supabase = createClient(
  supabaseUrl || fallbackUrl, 
  supabaseKey || fallbackKey
)

// Simple logo storage functions
export async function saveLogo(shop: string, logoUrl: string) {
  try {
    // Check if we have real Supabase credentials
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_API_KEY) {
      console.warn('Supabase credentials not available, returning mock success')
      return { success: true, data: { logo_url: logoUrl } }
    }
    const { data, error } = await supabase
      .from('shops')
      .upsert({
        id: shop,
        domain: shop,
        logo_url: logoUrl,
        access_token: 'temp-token',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (error) {
      console.error('Error saving logo:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error saving logo:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function getLogo(shop: string) {
  try {
    // Check if we have real Supabase credentials
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_API_KEY) {
      console.warn('Supabase credentials not available, returning null logo')
      return { success: true, logoUrl: null }
    }
    const { data, error } = await supabase
      .from('shops')
      .select('logo_url')
      .eq('domain', shop)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching logo:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, logoUrl: data?.logo_url || null }
  } catch (error) {
    console.error('Error fetching logo:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
