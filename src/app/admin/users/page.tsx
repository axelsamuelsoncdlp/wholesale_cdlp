'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Shield, 
  Mail, 
  Calendar, 
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX
} from 'lucide-react'

interface User {
  id: string
  email: string
  role: 'ADMIN' | 'STANDARD'
  mfaEnabled: boolean
  emailVerified: boolean
  lastLoginAt: string | null
  lastLoginIp: string | null
  isActive: boolean
  createdAt: string
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchUsers()
    }
  }, [session])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        setError('Failed to fetch users')
      }
    } catch (err) {
      setError('An error occurred while fetching users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isActive: !isActive } : user
        ))
      } else {
        setError('Failed to update user status')
      }
    } catch (err) {
      setError('An error occurred while updating user status')
    }
  }

  const handleChangeUserRole = async (userId: string, newRole: 'ADMIN' | 'STANDARD') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ))
      } else {
        setError('Failed to update user role')
      }
    } catch (err) {
      setError('An error occurred while updating user role')
    }
  }

  const handleApproveUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isActive: true } : user
        ))
      } else {
        setError('Failed to approve user')
      }
    } catch (err) {
      setError('An error occurred while approving user')
    }
  }

  const handleRejectUser = async (userId: string, reason?: string) => {
    if (!confirm('Are you sure you want to reject this user registration? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId))
      } else {
        setError('Failed to reject user')
      }
    } catch (err) {
      setError('An error occurred while rejecting user')
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingUsers = filteredUsers.filter(user => !user.isActive)
  const activeUsers = filteredUsers.filter(user => user.isActive)

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Admin access required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage CDLP Linesheet Generator user accounts
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users ({filteredUsers.length})
          </CardTitle>
          <CardDescription>
            All registered users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Pending Users Section */}
              {pendingUsers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-orange-600">
                    Pending Approvals ({pendingUsers.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">User</th>
                          <th className="text-left py-3 px-4">Registration Date</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingUsers.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-orange-50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">{user.email}</div>
                                <div className="text-sm text-gray-500">
                                  Pending admin approval
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(user.createdAt).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveUser(user.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRejectUser(user.id)}
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Active Users Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Active Users ({activeUsers.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Role</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Security</th>
                        <th className="text-left py-3 px-4">Last Login</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{user.email}</div>
                              <div className="text-sm text-gray-500">
                                Joined {new Date(user.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="default">
                              Active
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {user.emailVerified ? (
                                <Badge variant="outline" className="text-green-600">
                                  <Mail className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-red-600">
                                  <Mail className="h-3 w-3 mr-1" />
                                  Unverified
                                </Badge>
                              )}
                              {user.mfaEnabled ? (
                                <Badge variant="outline" className="text-green-600">
                                  <Shield className="h-3 w-3 mr-1" />
                                  MFA
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-yellow-600">
                                  <Shield className="h-3 w-3 mr-1" />
                                  No MFA
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {user.lastLoginAt ? (
                              <div>
                                <div className="text-sm">
                                  {new Date(user.lastLoginAt).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.lastLoginIp}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500">Never</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Deactivate
                              </Button>
                              {user.role !== 'ADMIN' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleChangeUserRole(user.id, 'ADMIN')}
                                >
                                  Make Admin
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No users found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
