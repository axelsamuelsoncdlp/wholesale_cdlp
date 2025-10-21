'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createSupabaseClient } from '@/lib/supabase'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { debugSupabaseConfig } from '@/lib/debug-supabase'

export default function LoginPage() {
  const [supabase] = useState(() => {
    // Debug environment variables
    debugSupabaseConfig()
    return createSupabaseClient()
  })
  const router = useRouter()

  const checkUserApproval = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_approved, role')
      .eq('id', userId)
      .single()

    if (profile?.is_approved) {
      router.push('/app')
    } else {
      router.push('/pending-approval')
    }
  }, [supabase, router])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Check if user is approved
        checkUserApproval(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, checkUserApproval])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            CDLP Linesheet Generator
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <div className="mt-8">
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4f46e5',
                    brandAccent: '#3730a3',
                  },
                },
              },
            }}
            providers={[]}
            redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/app`}
            onlyThirdPartyProviders={false}
            magicLink={false}
            showLinks={false}
          />
        </div>
      </div>
    </div>
  )
}
