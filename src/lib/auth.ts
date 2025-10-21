import bcrypt from 'bcryptjs'
import { authenticator } from 'otplib'
import { supabaseAdmin, User, Account, Session, LoginAttempt } from './supabase'
import { logSecurityEvent } from './security'

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Email domain validation
export function validateEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return domain === 'cdlp.com'
}

// Password policy enforcement
export function enforcePasswordPolicy(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// MFA utilities
export function generateMFASecret(): string {
  return authenticator.generateSecret()
}

export function generateMFAToken(secret: string): string {
  return authenticator.generate(secret)
}

export function verifyMFAToken(secret: string, token: string): boolean {
  try {
    return authenticator.verify({ token, secret })
  } catch {
    return false
  }
}

// User management
export async function createUser(email: string, hashedPassword: string, role: 'ADMIN' | 'STANDARD' = 'STANDARD') {
  if (!validateEmailDomain(email)) {
    throw new Error('Only @cdlp.com email addresses are allowed')
  }

  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    throw new Error('User already exists')
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert({
      email,
      hashed_password: hashedPassword,
      role,
      is_active: false // Admin approval required
    })
    .select()
    .single()

  if (error) throw error
  return user
}

export async function findUserByEmail(email: string) {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return user
}

export async function findUserById(id: string) {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return user
}

// Login attempt tracking
export async function recordLoginAttempt(
  email: string,
  ip: string,
  userAgent: string | null,
  success: boolean,
  reason?: string,
  userId?: string
) {
  const { error } = await supabaseAdmin
    .from('login_attempts')
    .insert({
      email,
      ip,
      user_agent: userAgent,
      success,
      failure_reason: reason
    })

  if (error) throw error

  // Log security event
  logSecurityEvent({
    event: success ? 'login_success' : 'login_failure',
    severity: success ? 'low' : 'medium',
    details: {
      email,
      ip,
      reason
    }
  })
}

// Brute force protection
export async function checkBruteForceProtection(email: string, ip: string): Promise<{ blocked: boolean; reason?: string }> {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  
  // Check failed attempts by email
  const { count: emailAttempts } = await supabaseAdmin
    .from('login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .eq('success', false)
    .gte('created_at', fifteenMinutesAgo)

  if (emailAttempts && emailAttempts >= 5) {
    return {
      blocked: true,
      reason: 'Too many failed login attempts for this email'
    }
  }

  // Check failed attempts by IP
  const { count: ipAttempts } = await supabaseAdmin
    .from('login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .eq('success', false)
    .gte('created_at', fifteenMinutesAgo)

  if (ipAttempts && ipAttempts >= 10) {
    return {
      blocked: true,
      reason: 'Too many failed login attempts from this IP'
    }
  }

  return { blocked: false }
}

// Account lockout
export async function lockUserAccount(userId: string, reason: string) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ is_active: false })
    .eq('id', userId)

  if (error) throw error

  logSecurityEvent({
    event: 'account_locked',
    userId,
    severity: 'high',
    details: { reason }
  })
}

// Session management
export async function createSession(userId: string, sessionToken: string, expires: Date) {
  const { data: session, error } = await supabaseAdmin
    .from('sessions')
    .insert({
      user_id: userId,
      session_token: sessionToken,
      expires: expires.toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return session
}

export async function findSessionByToken(sessionToken: string) {
  const { data: session, error } = await supabaseAdmin
    .from('sessions')
    .select(`
      *,
      users (*)
    `)
    .eq('session_token', sessionToken)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return session
}

export async function deleteSession(sessionToken: string) {
  const { error } = await supabaseAdmin
    .from('sessions')
    .delete()
    .eq('session_token', sessionToken)

  if (error) throw error
}

export async function deleteAllUserSessions(userId: string) {
  const { error } = await supabaseAdmin
    .from('sessions')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}

// Cleanup expired sessions
export async function cleanupExpiredSessions() {
  const now = new Date().toISOString()
  
  const { count, error } = await supabaseAdmin
    .from('sessions')
    .delete({ count: 'exact' })
    .lt('expires', now)

  if (error) throw error

  if (count && count > 0) {
    logSecurityEvent({
      event: 'expired_sessions_cleaned',
      severity: 'low',
      details: { count }
    })
  }

  return count || 0
}

// Update user last login
export async function updateUserLastLogin(userId: string, ip: string) {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .update({
      last_login_at: new Date().toISOString(),
      last_login_ip: ip
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return user
}

// Email verification
export async function verifyUserEmail(userId: string) {
  // Email verification removed - admin approval only
  return findUserById(userId)
}

// MFA setup
export async function enableMFA(userId: string, secret: string) {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .update({
      mfa_secret: secret,
      mfa_enabled: true
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return user
}

export async function disableMFA(userId: string) {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .update({
      mfa_secret: null,
      mfa_enabled: false
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return user
}

// Role management
export async function updateUserRole(userId: string, role: 'ADMIN' | 'STANDARD') {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .update({ role })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error

  logSecurityEvent({
    event: 'user_role_changed',
    userId,
    severity: 'high',
    details: { newRole: role }
  })

  return user
}

// User deactivation
export async function deactivateUser(userId: string, reason: string) {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .update({ is_active: false })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error

  // Delete all sessions
  await deleteAllUserSessions(userId)

  logSecurityEvent({
    event: 'user_deactivated',
    userId,
    severity: 'high',
    details: { reason }
  })

  return user
}

// Get user statistics
export async function getUserStats() {
  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: adminUsers }
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'ADMIN')
  ])

  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    adminUsers: adminUsers || 0
  }
}