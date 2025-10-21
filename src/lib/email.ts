import nodemailer from 'nodemailer'
import { logSecurityEvent } from './security'

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_SERVER_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER || 'apikey',
    pass: process.env.EMAIL_SERVER_PASSWORD
  }
}

const fromEmail = process.env.EMAIL_FROM || 'noreply@cdlp.com'
const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

// Create transporter
const transporter = nodemailer.createTransporter(emailConfig)

// Email templates
export const emailTemplates = {
  welcome: (email: string, verificationToken: string) => ({
    subject: 'Welcome to CDLP Linesheet Generator',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to CDLP Linesheet Generator</h2>
        <p>Hello,</p>
        <p>Your account has been created successfully. To complete your registration, please verify your email address by clicking the link below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/verify-email?token=${verificationToken}" 
             style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If you didn't create this account, please ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          CDLP Linesheet Generator - Secure wholesale catalog management
        </p>
      </div>
    `
  }),

  emailVerification: (email: string, verificationToken: string) => ({
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p>Hello,</p>
        <p>Please verify your email address to complete your account setup:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/verify-email?token=${verificationToken}" 
             style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If you didn't request this verification, please ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          CDLP Linesheet Generator
        </p>
      </div>
    `
  }),


  mfaSetup: (email: string) => ({
    subject: 'Complete your two-factor authentication setup',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Complete Your Security Setup</h2>
        <p>Hello,</p>
        <p>To enhance the security of your CDLP Linesheet Generator account, please complete your two-factor authentication setup:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/setup-mfa" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Set Up Two-Factor Authentication
          </a>
        </div>
        <p><strong>Why is this important?</strong></p>
        <ul>
          <li>Protects your account from unauthorized access</li>
          <li>Required for accessing sensitive wholesale data</li>
          <li>Complies with CDLP security policies</li>
        </ul>
        <p>If you have any questions, please contact your system administrator.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          CDLP Linesheet Generator - Secure wholesale catalog management
        </p>
      </div>
    `
  }),

  suspiciousActivity: (email: string, details: Record<string, unknown>) => ({
    subject: 'Suspicious activity detected on your account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Security Alert</h2>
        <p>Hello,</p>
        <p>We detected suspicious activity on your CDLP Linesheet Generator account:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Details:</strong></p>
          <ul>
            <li>Time: ${new Date().toLocaleString()}</li>
            <li>IP Address: ${details.ip || 'Unknown'}</li>
            <li>User Agent: ${details.userAgent || 'Unknown'}</li>
            <li>Event: ${details.event || 'Unknown'}</li>
          </ul>
        </div>
        <p>If this was you, no action is required. If you don't recognize this activity:</p>
        <ol>
          <li>Change your password immediately</li>
          <li>Review your account settings</li>
          <li>Contact your system administrator</li>
        </ol>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/login" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Access Your Account
          </a>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          CDLP Linesheet Generator Security Team
        </p>
      </div>
    `
  }),

  accountLocked: (email: string, reason: string) => ({
    subject: 'Your account has been temporarily locked',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Account Temporarily Locked</h2>
        <p>Hello,</p>
        <p>Your CDLP Linesheet Generator account has been temporarily locked for security reasons.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Reason:</strong> ${reason}</p>
        </div>
        <p>To unlock your account, please contact your system administrator.</p>
        <p>If you believe this is an error, please contact support immediately.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          CDLP Linesheet Generator Security Team
        </p>
      </div>
    `
  }),

  adminNotification: (userEmail: string, userId: string) => ({
    subject: 'New User Registration - Approval Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007cba;">New User Registration</h2>
        <p>Hello Admin,</p>
        <p>A new user has registered for the CDLP Linesheet Generator and requires your approval:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>User ID:</strong> ${userId}</p>
          <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>Please review and approve or reject this registration:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/admin/users" 
             style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 0 10px;">
            Review Registration
          </a>
        </div>
        <p><strong>Action Required:</strong> The user cannot access the system until you approve their account.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          CDLP Linesheet Generator Admin Panel
        </p>
      </div>
    `
  }),

  userApproved: (email: string) => ({
    subject: 'Your CDLP Linesheet Generator account has been approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Account Approved</h2>
        <p>Hello,</p>
        <p>Great news! Your CDLP Linesheet Generator account has been approved by an administrator.</p>
        <p>You can now sign in and start using the system:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/login" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Sign In Now
          </a>
        </div>
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Sign in with your email and password</li>
          <li>Complete the two-factor authentication setup</li>
          <li>Start creating your linesheets</li>
        </ol>
        <p>If you have any questions, please contact your system administrator.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          CDLP Linesheet Generator Team
        </p>
      </div>
    `
  }),

  userRejected: (email: string, reason?: string) => ({
    subject: 'CDLP Linesheet Generator account registration declined',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Registration Declined</h2>
        <p>Hello,</p>
        <p>Unfortunately, your registration for the CDLP Linesheet Generator has been declined.</p>
        ${reason ? `
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Reason:</strong> ${reason}</p>
        </div>
        ` : ''}
        <p>If you believe this is an error or have questions, please contact your system administrator.</p>
        <p>You may reapply for access if your circumstances change.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          CDLP Linesheet Generator Team
        </p>
      </div>
    `
  })
}

// Send email function
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      html
    })

    logSecurityEvent({
      event: 'email_sent',
      severity: 'low',
      details: {
        to,
        subject,
        messageId: info.messageId
      }
    })

    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    
    logSecurityEvent({
      event: 'email_failed',
      severity: 'medium',
      details: {
        to,
        subject,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })

    return false
  }
}

// Specific email functions
export async function sendWelcomeEmail(email: string, verificationToken: string): Promise<boolean> {
  const template = emailTemplates.welcome(email, verificationToken)
  return sendEmail(email, template.subject, template.html)
}

export async function sendEmailVerification(email: string, verificationToken: string): Promise<boolean> {
  const template = emailTemplates.emailVerification(email, verificationToken)
  return sendEmail(email, template.subject, template.html)
}


export async function sendMFASetupEmail(email: string): Promise<boolean> {
  const template = emailTemplates.mfaSetup(email)
  return sendEmail(email, template.subject, template.html)
}

export async function sendSuspiciousActivityAlert(email: string, details: Record<string, unknown>): Promise<boolean> {
  const template = emailTemplates.suspiciousActivity(email, details)
  return sendEmail(email, template.subject, template.html)
}

export async function sendAccountLockedEmail(email: string, reason: string): Promise<boolean> {
  const template = emailTemplates.accountLocked(email, reason)
  return sendEmail(email, template.subject, template.html)
}

export async function sendAdminNotificationEmail(userEmail: string, userId: string): Promise<boolean> {
  // Send to admin email (you can configure this)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@cdlp.com'
  const template = emailTemplates.adminNotification(userEmail, userId)
  return sendEmail(adminEmail, template.subject, template.html)
}

export async function sendUserApprovedEmail(email: string): Promise<boolean> {
  const template = emailTemplates.userApproved(email)
  return sendEmail(email, template.subject, template.html)
}

export async function sendUserRejectedEmail(email: string, reason?: string): Promise<boolean> {
  const template = emailTemplates.userRejected(email, reason)
  return sendEmail(email, template.subject, template.html)
}

// Test email configuration
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    await transporter.verify()
    return true
  } catch (error) {
    console.error('Email configuration test failed:', error)
    return false
  }
}
