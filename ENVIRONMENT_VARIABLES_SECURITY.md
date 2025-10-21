# Environment Variables for Security Implementation

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### NextAuth Configuration
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-64-character-secret-key-here
```

### Database (Supabase PostgreSQL)
```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

### Security
```bash
ENCRYPTION_KEY=your-32-character-encryption-key
MFA_ISSUER=CDLP Linesheet
```

### Shopify Configuration
```bash
SHOPIFY_API_KEY=your-shopify-api-key
SHOPIFY_API_SECRET=your-shopify-api-secret
SHOPIFY_ACCESS_TOKEN=your-shopify-access-token
```

### Admin Configuration
```bash
ADMIN_EMAIL=admin@cdlp.com
```

### Optional Security Settings
```bash
ALLOWED_IPS=192.168.1.1,10.0.0.1
SECURITY_WEBHOOK_URL=https://your-security-monitoring-service.com/webhook
```

## Generating Secure Keys

### NEXTAUTH_SECRET (64 characters)
```bash
openssl rand -base64 32
```

### ENCRYPTION_KEY (32 characters)
```bash
openssl rand -hex 16
```

## Production Deployment

For production deployment, ensure all environment variables are set in your hosting platform (Vercel, Netlify, etc.) and never commit the `.env.local` file to version control.
