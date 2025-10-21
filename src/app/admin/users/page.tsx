'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { Profile } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  const loadUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const checkUserAndLoadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      window.location.href = '/login'
      return
    }

    // Check if current user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'ADMIN') {
      window.location.href = '/app'
      return
    }

    loadUsers()
  }, [supabase, loadUsers])

  useEffect(() => {
    checkUserAndLoadData()
  }, [checkUserAndLoadData])

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', userId)

      if (error) throw error
      
      // Reload users
      loadUsers()
    } catch (error) {
      console.error('Error approving user:', error)
    }
  }

  const rejectUser = async (userId: string) => {
    try {
      // Delete the user from auth.users (this will cascade to profiles)
      const { error } = await supabase.auth.admin.deleteUser(userId)

      if (error) throw error
      
      // Reload users
      loadUsers()
    } catch (error) {
      console.error('Error rejecting user:', error)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    )
  }

  const pendingUsers = users.filter(user => !user.is_approved)
  const approvedUsers = users.filter(user => user.is_approved)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          </div>

          {/* Pending Approvals */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-red-600">Pending Approvals ({pendingUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <p className="text-gray-500">No pending approvals</p>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-sm text-gray-500">
                          Role: {user.role} | Created: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => approveUser(user.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button 
                          onClick={() => rejectUser(user.id)}
                          variant="destructive"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approved Users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Approved Users ({approvedUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {approvedUsers.length === 0 ? (
                <p className="text-gray-500">No approved users</p>
              ) : (
                <div className="space-y-4">
                  {approvedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-sm text-gray-500">
                          Role: {user.role} | Approved: {new Date(user.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.role === 'ADMIN' && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
