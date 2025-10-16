# Authentication System Documentation

## Overview

The CDLP Linesheet Generator implements a comprehensive authentication system with multi-factor authentication (MFA), role-based access control, and enterprise-grade security features.

## Authentication Flow

### 1. User Registration
- Only `@cdlp.com` email addresses are allowed
- Password must meet enterprise security requirements
- Email verification is required before account activation
- All registration attempts are logged

### 2. Login Process
- Email/password authentication
- Brute force protection (5 attempts per 15 minutes)
- Account lockout after repeated failures
- MFA verification if enabled
- Session creation with JWT tokens

### 3. Multi-Factor Authentication (MFA)
- Obligatorisk för alla användare
- TOTP-based authentication (Google Authenticator, Authy, etc.)
- Backup codes for account recovery
- QR code setup process

### 4. Session Management
- JWT-based sessions with 24-hour lifetime
- Secure HTTP-only cookies
- Automatic session cleanup
- Single sign-out capability

## Security Features

### Password Policy
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Bcrypt hashing with salt rounds

### Rate Limiting
- Login attempts: 5 per 15 minutes per IP
- Registration: 3 per hour per IP
- MFA verification: 5 per 5 minutes
- Password reset: 3 per hour per email
- API requests: 100 per 15 minutes per session

### Brute Force Protection
- Account lockout after 5 failed attempts
- Progressive delays (exponential backoff)
- IP-based rate limiting
- Email notifications for suspicious activity

### Audit Logging
- All authentication events logged
- IP addresses and user agents tracked
- Severity levels: LOW, MEDIUM, HIGH, CRITICAL
- 90-day retention period

## User Roles

### ADMIN
- Full system access
- User management capabilities
- Audit log viewing
- Security settings configuration

### STANDARD
- Linesheet creation and management
- Product access
- Basic account settings

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/setup-mfa` - MFA setup
- `POST /api/auth/verify-mfa` - MFA verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Admin (Admin only)
- `GET /api/admin/users` - List all users
- `POST /api/admin/users/[id]/toggle-status` - Toggle user status
- `POST /api/admin/users/[id]/role` - Change user role
- `GET /api/admin/audit-logs` - View audit logs

## Security Headers

The application implements comprehensive security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- Content Security Policy (CSP)

## Middleware Protection

The middleware enforces:
- Authentication checks on protected routes
- Email verification requirements
- MFA enforcement for sensitive operations
- Role-based access control
- Security header injection
- Audit logging

## Database Security

- PostgreSQL with encrypted connections
- Parameterized queries (Prisma ORM)
- Sensitive data encryption at rest
- Regular security updates

## Compliance

The authentication system complies with:
- OWASP Top 10 security guidelines
- GDPR data protection requirements
- SOC 2 security principles
- Zero-trust architecture

## Monitoring and Alerts

- Real-time security event monitoring
- Email notifications for critical events
- Admin dashboard for security oversight
- Automated threat detection

## Incident Response

### High Severity Events
- Invalid HMAC signatures
- Unauthorized access attempts
- Rate limit violations
- Admin access attempts from unauthorized IPs

### Medium Severity Events
- Missing authentication parameters
- Direct access attempts
- OAuth callback failures

### Low Severity Events
- Normal API usage
- Successful authentications
- Regular product access

## Best Practices

1. **Regular Security Reviews**: Monthly security audits
2. **Password Management**: Encourage password managers
3. **MFA Enforcement**: Mandatory for all users
4. **Session Management**: Regular session cleanup
5. **Audit Logging**: Continuous monitoring
6. **Incident Response**: Clear escalation procedures

## Support

For security-related issues or questions:
- Contact the system administrator
- Review audit logs for suspicious activity
- Report security incidents immediately
- Follow incident response procedures
