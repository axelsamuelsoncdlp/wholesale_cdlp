'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { Profile } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'STANDARD' as 'ADMIN' | 'STANDARD',
    isApproved: true,
  })
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)
    setCreateSuccess(false)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setCreateError('You must be logged in to create users')
        setCreating(false)
        return
      }

      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user')
      }

      setCreateSuccess(true)
      setFormData({
        email: '',
        password: '',
        role: 'STANDARD',
        isApproved: true,
      })
      setShowCreateForm(false)
      
      // Reload users list
      loadUsers()
      
      // Clear success message after 3 seconds
      setTimeout(() => setCreateSuccess(false), 3000)
    } catch (error) {
      console.error('Error creating user:', error)
      setCreateError(error instanceof Error ? error.message : 'Failed to create user')
    } finally {
      setCreating(false)
    }
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
            <div className="flex space-x-2">
              <Button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {showCreateForm ? 'Cancel' : 'Create New User'}
              </Button>
              <Button onClick={signOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>

          {/* Success Message */}
          {createSuccess && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              User created successfully!
            </div>
          )}

          {/* Create User Form */}
          {showCreateForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create New User</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  {createError && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {createError}
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="user@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password * (min 8 characters)
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      required
                      minLength={8}
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'STANDARD' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="STANDARD">Standard</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="isApproved"
                      type="checkbox"
                      checked={formData.isApproved}
                      onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isApproved" className="ml-2 block text-sm text-gray-700">
                      Approve user immediately
                    </label>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      type="submit" 
                      disabled={creating}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {creating ? 'Creating...' : 'Create User'}
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => {
                        setShowCreateForm(false)
                        setCreateError(null)
                        setFormData({
                          email: '',
                          password: '',
                          role: 'STANDARD',
                          isApproved: true,
                        })
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

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
