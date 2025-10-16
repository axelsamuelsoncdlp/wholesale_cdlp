'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Search, 
  Calendar, 
  User, 
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle
} from 'lucide-react'

interface AuditLog {
  id: string
  userId: string | null
  event: string
  ip: string | null
  userAgent: string | null
  details: any
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  createdAt: string
  user?: {
    email: string
  }
}

export default function AdminAuditPage() {
  const { data: session } = useSession()
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('ALL')
  const [eventFilter, setEventFilter] = useState<string>('ALL')

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchAuditLogs()
    }
  }, [session])

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('/api/admin/audit-logs')
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data.logs)
      } else {
        setError('Failed to fetch audit logs')
      }
    } catch (err) {
      setError('An error occurred while fetching audit logs')
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'HIGH':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'MEDIUM':
        return <Info className="h-4 w-4 text-yellow-600" />
      case 'LOW':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'destructive'
      case 'HIGH':
        return 'destructive'
      case 'MEDIUM':
        return 'secondary'
      case 'LOW':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.ip?.includes(searchTerm)
    
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter
    const matchesEvent = eventFilter === 'ALL' || log.event === eventFilter
    
    return matchesSearch && matchesSeverity && matchesEvent
  })

  const uniqueEvents = [...new Set(auditLogs.map(log => log.event))]

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
          <h1 className="text-3xl font-light tracking-tight">Security Audit Logs</h1>
          <p className="text-muted-foreground mt-2">
            Monitor security events and user activities
          </p>
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
            <Shield className="h-5 w-5" />
            Audit Logs ({filteredLogs.length})
          </CardTitle>
          <CardDescription>
            Security events and user activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="ALL">All Events</option>
              {uniqueEvents.map(event => (
                <option key={event} value={event}>{event}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading audit logs...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSeverityIcon(log.severity)}
                        <Badge variant={getSeverityColor(log.severity) as any}>
                          {log.severity}
                        </Badge>
                        <span className="font-medium">{log.event}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">User:</span> {log.user?.email || 'System'}
                        </div>
                        <div>
                          <span className="font-medium">IP:</span> {log.ip || 'Unknown'}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {new Date(log.createdAt).toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">User Agent:</span> {log.userAgent || 'Unknown'}
                        </div>
                      </div>

                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-3">
                          <details className="text-sm">
                            <summary className="cursor-pointer font-medium text-gray-700">
                              View Details
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredLogs.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No audit logs found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
