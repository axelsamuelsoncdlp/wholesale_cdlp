import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const severity = searchParams.get('severity')
    const event = searchParams.get('event')

    let query = supabaseAdmin
      .from('audit_logs')
      .select(`
        *,
        users!audit_logs_user_id_fkey (
          email
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (severity && severity !== 'ALL') {
      query = query.eq('severity', severity)
    }
    
    if (event && event !== 'ALL') {
      query = query.eq('event', event)
    }

    const { data: logs, error: logsError } = await query

    if (logsError) throw logsError

    // Get total count
    let countQuery = supabaseAdmin
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })

    if (severity && severity !== 'ALL') {
      countQuery = countQuery.eq('severity', severity)
    }
    
    if (event && event !== 'ALL') {
      countQuery = countQuery.eq('event', event)
    }

    const { count: total, error: countError } = await countQuery

    if (countError) throw countError

    return NextResponse.json({
      logs: logs || [],
      total: total || 0,
      limit,
      offset
    })

  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
