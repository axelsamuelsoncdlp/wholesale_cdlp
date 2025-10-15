import { createAdminApiClient } from '@shopify/admin-api-client'
import crypto from 'crypto'

export interface ShopifyConfig {
  apiKey: string
  apiSecret: string
  scopes: string[]
  appUrl: string
}

export const shopifyConfig: ShopifyConfig = {
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecret: process.env.SHOPIFY_API_SECRET!,
  scopes: process.env.SHOPIFY_SCOPES?.split(',') || ['read_products'],
  appUrl: process.env.SHOPIFY_APP_URL || 'http://localhost:3000',
}

export function createShopifyClient(shopDomain: string, accessToken: string) {
  return createAdminApiClient({
    storeDomain: shopDomain,
    apiVersion: '2024-10',
    accessToken,
  })
}

export function verifyShopifyHmac(query: Record<string, string>): boolean {
  const { hmac, ...params } = query
  if (!hmac) return false

  const message = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')

  const hash = crypto
    .createHmac('sha256', shopifyConfig.apiSecret)
    .update(message)
    .digest('hex')

  return hash === hmac
}

export function getShopifyOAuthUrl(shop: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: shopifyConfig.apiKey,
    scope: shopifyConfig.scopes.join(','),
    redirect_uri: `${shopifyConfig.appUrl}/auth/callback`,
    state: state || crypto.randomBytes(16).toString('hex'),
  })

  return `https://${shop}/admin/oauth/authorize?${params.toString()}`
}

export async function exchangeCodeForToken(
  shop: string,
  code: string
): Promise<{ accessToken: string; scope: string }> {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: shopifyConfig.apiKey,
      client_secret: shopifyConfig.apiSecret,
      code,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: ${response.statusText}`)
  }

  return response.json()
}

// GraphQL Queries
export const PRODUCTS_QUERY = `
  query getProducts($first: Int!, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query) {
      edges {
        node {
          id
          title
          handle
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 100) {
            edges {
              node {
                id
                sku
                price
                compareAtPrice
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          metafields(first: 50, namespace: "custom") {
            edges {
              node {
                namespace
                key
                value
              }
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

export const PRICE_LISTS_QUERY = `
  query getPriceLists($first: Int!) {
    priceLists(first: $first) {
      edges {
        node {
          id
          name
          currency
          fixedPrices(first: 100) {
            edges {
              node {
                variantId
                price
              }
            }
          }
        }
      }
    }
  }
`

export const COLLECTIONS_QUERY = `
  query getCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`
