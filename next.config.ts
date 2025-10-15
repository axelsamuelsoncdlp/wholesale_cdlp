import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  
  // Security headers
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM https://admin.shopify.com',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.shopify.com",
              "style-src 'self' 'unsafe-inline' https://*.shopify.com",
              "img-src 'self' data: https: *.myshopify.com",
              "connect-src 'self' https://*.shopify.com",
              "frame-ancestors https://*.shopify.com https://admin.shopify.com",
              "form-action 'self'",
              "base-uri 'self'",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  
  // Environment variables validation
  env: {
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
    SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  },
  
  // Disable source maps in production for security
  productionBrowserSourceMaps: false,
  
  // Compress responses
  compress: true,
  
  // PoweredBy header removal
  poweredByHeader: false,
};

export default nextConfig;
