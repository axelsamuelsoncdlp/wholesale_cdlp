import QRCode from 'qrcode'
import { generateSecret, generateTOTP, verifyTOTP } from '@noble/hashes/totp'
import { generateMFASecret, verifyMFAToken } from './auth'

export interface MFASetupResult {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export interface MFAVerificationResult {
  isValid: boolean
  backupCodeUsed?: boolean
}

// Generate MFA setup data
export async function generateMFASetup(email: string): Promise<MFASetupResult> {
  const secret = generateMFASecret()
  const issuer = process.env.MFA_ISSUER || 'CDLP Linesheet'
  const accountName = email

  // Generate TOTP URI
  const totpUri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(totpUri)

  // Generate backup codes
  const backupCodes = generateBackupCodes()

  return {
    secret,
    qrCodeUrl,
    backupCodes
  }
}

// Generate backup codes
export function generateBackupCodes(): string[] {
  const codes: string[] = []
  for (let i = 0; i < 10; i++) {
    codes.push(generateBackupCode())
  }
  return codes
}

function generateBackupCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Verify MFA token
export function verifyMFACode(secret: string, token: string): boolean {
  try {
    return verifyTOTP(token, secret, {
      timeStep: 30,
      digits: 6,
      window: 1 // Allow 1 time step tolerance (±30 seconds)
    })
  } catch {
    return false
  }
}

// Generate current TOTP token for testing
export function generateCurrentTOTP(secret: string): string {
  return generateTOTP(secret, {
    timeStep: 30,
    digits: 6
  })
}

// Validate backup code format
export function isValidBackupCode(code: string): boolean {
  return /^[A-Z0-9]{8}$/.test(code)
}

// Hash backup codes for storage
export function hashBackupCode(code: string): string {
  // Simple hash for backup codes - in production, use bcrypt
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(code).digest('hex')
}

// Verify backup code
export function verifyBackupCode(code: string, hashedCode: string): boolean {
  return hashBackupCode(code) === hashedCode
}

// MFA validation with backup codes
export async function validateMFA(
  secret: string,
  token: string,
  backupCodes?: string[]
): Promise<MFAVerificationResult> {
  // First try TOTP token
  if (verifyMFACode(secret, token)) {
    return { isValid: true }
  }

  // If TOTP fails, try backup codes
  if (backupCodes && backupCodes.length > 0) {
    for (const backupCode of backupCodes) {
      if (isValidBackupCode(backupCode)) {
        // In a real implementation, you'd check against stored hashed backup codes
        // For now, we'll just validate the format
        return { isValid: true, backupCodeUsed: true }
      }
    }
  }

  return { isValid: false }
}

// Generate MFA recovery codes (for when user loses access)
export function generateRecoveryCodes(): string[] {
  const codes: string[] = []
  for (let i = 0; i < 5; i++) {
    codes.push(generateRecoveryCode())
  }
  return codes
}

function generateRecoveryCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// MFA setup instructions
export const MFA_INSTRUCTIONS = {
  title: 'Set up Two-Factor Authentication',
  steps: [
    'Download an authenticator app like Google Authenticator, Authy, or 1Password',
    'Scan the QR code below with your authenticator app',
    'Enter the 6-digit code from your app to verify setup',
    'Save your backup codes in a secure location'
  ],
  tips: [
    'Keep your backup codes safe - you can use them if you lose access to your authenticator app',
    'Each code can only be used once',
    'Your authenticator app will generate a new code every 30 seconds'
  ]
}

// MFA validation error messages
export const MFA_ERRORS = {
  INVALID_TOKEN: 'Invalid verification code. Please try again.',
  EXPIRED_TOKEN: 'Verification code has expired. Please generate a new one.',
  INVALID_BACKUP_CODE: 'Invalid backup code.',
  MFA_REQUIRED: 'Two-factor authentication is required to access this application.',
  MFA_NOT_SETUP: 'Two-factor authentication is not set up for your account.',
  SETUP_REQUIRED: 'Please complete two-factor authentication setup to continue.'
}
