import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Client-side client for user operations
export const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Server-side client for middleware (without cookies import)
export function createSupabaseServerClient() {
  return createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return undefined // Will be handled by middleware
      },
      set(name: string, value: string, options: any) {
        // Will be handled by middleware
      },
      remove(name: string, options: any) {
        // Will be handled by middleware
      },
    },
  })
}

// Client-side helper
export function createSupabaseClient() {
  return createBrowserClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Logo management functions
export async function saveLogo(shop: string, logoUrl: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('shops')
      .upsert({
        id: shop,
        domain: shop,
        logo_url: logoUrl,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function getLogo(shop: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('shops')
      .select('logo_url')
      .eq('domain', shop)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return { 
      success: true, 
      logoUrl: data?.logo_url || null 
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      logoUrl: null
    }
  }
}

// Database types for Supabase Auth
export interface Profile {
  id: string // UUID matching auth.users.id
  email: string
  role: 'ADMIN' | 'STANDARD'
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface Shop {
  id: string
  domain: string
  access_token?: string
  logo_url?: string
  created_at: string
  updated_at: string
}