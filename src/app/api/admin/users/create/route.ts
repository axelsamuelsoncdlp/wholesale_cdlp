import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Get current user session from cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set() {
            // Will be handled by response
          },
          remove() {
            // Will be handled by response
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const supabaseAdmin = getSupabaseAdmin()
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { email, password, role = 'STANDARD', isApproved = true } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Validate role
    if (role !== 'ADMIN' && role !== 'STANDARD') {
      return NextResponse.json(
        { error: 'Invalid role. Must be ADMIN or STANDARD' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers.users.find((u) => u.email === email)

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json(
        { error: 'Failed to create user', details: authError.message },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'No user data returned' },
        { status: 500 }
      )
    }

    // Wait a moment for the trigger to create the profile automatically
    await new Promise(resolve => setTimeout(resolve, 500))

    // Update the automatically created profile (trigger creates it with STANDARD role and is_approved=false)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        email: email,
        role: role,
        is_approved: isApproved,
      })
      .eq('id', authData.user.id)

    if (profileError) {
      // If profile update fails, check if profile exists (maybe trigger didn't run)
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single()

      if (!existingProfile) {
        // Profile doesn't exist, try to create it manually
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: email,
            role: role,
            is_approved: isApproved,
          })

        if (insertError) {
          // If profile creation also fails, delete the auth user
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
          console.error('Error creating profile:', insertError)
          return NextResponse.json(
            { error: 'Failed to create profile', details: insertError.message },
            { status: 500 }
          )
        }
      } else {
        // Profile exists but update failed - this is unexpected
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        console.error('Error updating profile:', profileError)
        return NextResponse.json(
          { error: 'Failed to update profile', details: profileError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: email,
        role: role,
        is_approved: isApproved,
      },
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

