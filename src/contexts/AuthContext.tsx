'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase'
import { Profile } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  const loadProfile = useCallback(async (userId: string) => {
    try {
      console.log('[AuthContext] Loading profile for user:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[AuthContext] Error loading profile:', error)
        throw error
      }
      
      console.log('[AuthContext] Profile loaded successfully:', data)
      setProfile(data)
    } catch (error) {
      console.error('[AuthContext] Error loading profile:', error)
      setProfile(null)
    }
  }, [supabase])

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('[AuthContext] Getting initial session...')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[AuthContext] Initial session:', session ? 'Found' : 'None')
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('[AuthContext] User found, loading profile...')
        await loadProfile(session.user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state change:', event, session ? 'Session found' : 'No session')
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('[AuthContext] User found in auth change, loading profile...')
        await loadProfile(session.user.id)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [loadProfile, supabase.auth])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
