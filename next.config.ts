import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.shopify.com https://admin.shopify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.shopify.com; style-src 'self' 'unsafe-inline' https://*.shopify.com; img-src 'self' data: https:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
