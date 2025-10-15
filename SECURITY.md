# 🔒 Security Configuration for CDLP Linesheet Generator

## Enterprise Security Features

This application implements enterprise-grade security measures to protect sensitive product data and ensure maximum security for high-value brands.

### 🔐 Security Features Implemented

#### 1. **HMAC Validation**
- All Shopify requests are validated using HMAC signatures
- Prevents request tampering and unauthorized access
- Timing-safe comparison to prevent timing attacks

#### 2. **Rate Limiting**
- API requests: 100 requests per 15 minutes
- Authentication: 5 attempts per minute
- Product requests: 20 requests per minute
- PDF rendering: 10 renders per minute

#### 3. **Security Headers**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- Comprehensive Content Security Policy

#### 4. **Input Validation & Sanitization**
- All user inputs are validated and sanitized
- Shopify domain validation with regex patterns
- Product ID format validation
- Maximum input length limits

#### 5. **Audit Logging**
- All security events are logged with timestamps
- IP addresses and user agents tracked
- Severity levels: low, medium, high, critical
- Failed authentication attempts monitored

#### 6. **Access Control**
- Shop-based authentication required
- IP whitelisting for admin routes (optional)
- Session validation
- Token-based API access

#### 7. **Data Protection**
- Sensitive data encryption at rest (configurable)
- Database connection security
- Environment variable protection

### 🛡️ Required Environment Variables

#### **Critical Security Variables**

```bash
# Shopify App Credentials
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret

# Database Security
DATABASE_URL=your_secure_database_url

# Encryption Key (32+ characters)
ENCRYPTION_KEY=your_32_character_encryption_key_here

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### **Optional Security Variables**

```bash
# IP Whitelist (comma-separated)
ALLOWED_IPS=192.168.1.1,10.0.0.1

# Database Encryption
DATABASE_ENCRYPTION_KEY=your_database_encryption_key

# Security Monitoring
SECURITY_WEBHOOK_URL=https://your-security-monitoring-service.com/webhook
```

### 🔧 Security Configuration

#### **Production Deployment Checklist**

- [ ] All environment variables set
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Database connection encrypted
- [ ] Rate limiting configured
- [ ] Security headers active
- [ ] Audit logging enabled
- [ ] IP whitelist configured (if needed)
- [ ] Regular security updates scheduled

#### **Security Monitoring**

The application logs the following security events:

- `oauth_callback_attempt` - OAuth login attempts
- `oauth_callback_invalid_hmac` - Invalid HMAC signatures
- `oauth_callback_success` - Successful authentications
- `products_api_access` - Product data access
- `products_api_unauthenticated` - Unauthorized access attempts
- `admin_access_denied` - Blocked admin access
- `direct_access_attempt` - Direct URL access attempts

#### **Rate Limiting Configuration**

```typescript
// API requests: 100 per 15 minutes
API_RATE_LIMITER = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})

// Authentication: 5 per minute
AUTH_RATE_LIMITER = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
})

// Product requests: 20 per minute
PRODUCT_RATE_LIMITER = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
})
```

### 🚨 Security Incident Response

#### **High Severity Events**
- Invalid HMAC signatures
- Unauthorized access attempts
- Rate limit violations
- Admin access attempts from unauthorized IPs

#### **Medium Severity Events**
- Missing authentication parameters
- Direct access attempts
- OAuth callback failures

#### **Low Severity Events**
- Normal API usage
- Successful authentications
- Regular product access

### 📊 Security Metrics

Monitor these metrics for security health:

- Authentication success/failure rates
- API request patterns
- Rate limit violations
- Unusual access patterns
- Failed HMAC validations

### 🔄 Regular Security Tasks

1. **Daily**: Review security logs
2. **Weekly**: Check rate limiting effectiveness
3. **Monthly**: Update security dependencies
4. **Quarterly**: Security audit and penetration testing

### 📞 Security Contacts

For security incidents or questions:

- **Emergency**: [Your security contact]
- **General**: [Your security team email]
- **Bug Reports**: [Your security bug reporting process]

---

**⚠️ IMPORTANT**: This application handles sensitive product data for high-value brands. All security measures must be properly configured and monitored before production deployment.
