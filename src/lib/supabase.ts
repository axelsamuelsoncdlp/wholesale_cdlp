import { createClient } from '@supabase/supabase-js'

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

// Database types
export interface User {
  id: string
  email: string
  hashed_password?: string
  role: 'ADMIN' | 'STANDARD'
  mfa_secret?: string
  mfa_enabled: boolean
  last_login_at?: string
  last_login_ip?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  type: string
  provider: string
  provider_account_id: string
  refresh_token?: string
  access_token?: string
  expires_at?: number
  token_type?: string
  scope?: string
  id_token?: string
  session_state?: string
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  session_token: string
  user_id: string
  expires: string
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id?: string
  event: string
  shop?: string
  ip?: string
  user_agent?: string
  details?: Record<string, unknown>
  severity: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
}

export interface LoginAttempt {
  id: string
  email: string
  ip: string
  user_agent?: string
  success: boolean
  failure_reason?: string
  created_at: string
}

export interface Shop {
  id: string
  domain: string
  access_token?: string
  logo_url?: string
  created_at: string
  updated_at: string
}