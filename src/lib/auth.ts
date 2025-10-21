import bcrypt from 'bcryptjs'
import { authenticator } from 'otplib'
import { randomBytes } from 'crypto'
import { db } from './db'
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

// Email verification token
export function generateEmailVerificationToken(): string {
  return randomBytes(32).toString('hex')
}

// User management
export async function createUser(email: string, hashedPassword: string, role: 'ADMIN' | 'STANDARD' = 'STANDARD') {
  if (!validateEmailDomain(email)) {
    throw new Error('Only @cdlp.com email addresses are allowed')
  }

  const existingUser = await db.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error('User already exists')
  }

  return db.user.create({
    data: {
      email,
      hashedPassword,
      role,
      emailVerified: false
    }
  })
}

export async function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email }
  })
}

export async function findUserById(id: string) {
  return db.user.findUnique({
    where: { id }
  })
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
  await db.loginAttempt.create({
    data: {
      email,
      ip,
      userAgent,
      success,
      reason,
      userId
    }
  })

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
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
  
  // Check failed attempts by email
  const emailAttempts = await db.loginAttempt.count({
    where: {
      email,
      success: false,
      createdAt: {
        gte: fifteenMinutesAgo
      }
    }
  })

  if (emailAttempts >= 5) {
    return {
      blocked: true,
      reason: 'Too many failed login attempts for this email'
    }
  }

  // Check failed attempts by IP
  const ipAttempts = await db.loginAttempt.count({
    where: {
      ip,
      success: false,
      createdAt: {
        gte: fifteenMinutesAgo
      }
    }
  })

  if (ipAttempts >= 10) {
    return {
      blocked: true,
      reason: 'Too many failed login attempts from this IP'
    }
  }

  return { blocked: false }
}

// Account lockout
export async function lockUserAccount(userId: string, reason: string) {
  await db.user.update({
    where: { id: userId },
    data: { isActive: false }
  })

  logSecurityEvent({
    event: 'account_locked',
    userId,
    severity: 'high',
    details: { reason }
  })
}

// Session management
export async function createSession(userId: string, sessionToken: string, expires: Date) {
  return db.session.create({
    data: {
      userId,
      sessionToken,
      expires
    }
  })
}

export async function findSessionByToken(sessionToken: string) {
  return db.session.findUnique({
    where: { sessionToken },
    include: {
      user: true
    }
  })
}

export async function deleteSession(sessionToken: string) {
  return db.session.delete({
    where: { sessionToken }
  })
}

export async function deleteAllUserSessions(userId: string) {
  return db.session.deleteMany({
    where: { userId }
  })
}

// Cleanup expired sessions
export async function cleanupExpiredSessions() {
  const deleted = await db.session.deleteMany({
    where: {
      expires: {
        lt: new Date()
      }
    }
  })

  if (deleted.count > 0) {
    logSecurityEvent({
      event: 'expired_sessions_cleaned',
      severity: 'low',
      details: { count: deleted.count }
    })
  }

  return deleted.count
}

// Update user last login
export async function updateUserLastLogin(userId: string, ip: string) {
  return db.user.update({
    where: { id: userId },
    data: {
      lastLoginAt: new Date(),
      lastLoginIp: ip
    }
  })
}

// Email verification
export async function verifyUserEmail(userId: string) {
  return db.user.update({
    where: { id: userId },
    data: {
      emailVerified: true,
      emailVerifiedAt: new Date()
    }
  })
}

// MFA setup
export async function enableMFA(userId: string, secret: string) {
  return db.user.update({
    where: { id: userId },
    data: {
      mfaSecret: secret,
      mfaEnabled: true
    }
  })
}

export async function disableMFA(userId: string) {
  return db.user.update({
    where: { id: userId },
    data: {
      mfaSecret: null,
      mfaEnabled: false
    }
  })
}

// Role management
export async function updateUserRole(userId: string, role: 'ADMIN' | 'STANDARD') {
  const user = await db.user.update({
    where: { id: userId },
    data: { role }
  })

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
  const user = await db.user.update({
    where: { id: userId },
    data: { isActive: false }
  })

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
  const [totalUsers, activeUsers, adminUsers, verifiedUsers] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { isActive: true } }),
    db.user.count({ where: { role: 'ADMIN' } }),
    db.user.count({ where: { emailVerified: true } })
  ])

  return {
    totalUsers,
    activeUsers,
    adminUsers,
    verifiedUsers
  }
}
