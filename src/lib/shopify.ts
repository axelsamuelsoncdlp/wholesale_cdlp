import { db } from '@/lib/db'

const SHOPIFY_API_VERSION = '2024-10'

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  images: {
    edges: Array<{
      node: {
        id: string
        url: string
        altText?: string
      }
    }>
  }
  variants: {
    edges: Array<{
      node: {
        id: string
        sku?: string
        price: string
        compareAtPrice?: string
        selectedOptions: Array<{
          name: string
          value: string
        }>
      }
    }>
  }
  metafields: {
    edges: Array<{
      node: {
        id: string
        namespace: string
        key: string
        value: string
      }
    }>
  }
}

export interface ShopifyGraphQLResponse<T> {
  data: T
  errors?: Array<{
    message: string
    locations?: Array<{
      line: number
      column: number
    }>
  }>
}

// Shopify GraphQL queries
export const GET_PRODUCTS_QUERY = `
  query getProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          images(first: 1) {
            edges {
              node {
                id
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
          metafields(first: 10, namespace: "custom") {
            edges {
              node {
                id
                namespace
                key
                value
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

export const GET_PRODUCT_BY_ID_QUERY = `
  query getProduct($id: ID!) {
    product(id: $id) {
      id
      title
      handle
      images(first: 5) {
        edges {
          node {
            id
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
      metafields(first: 20, namespace: "custom") {
        edges {
          node {
            id
            namespace
            key
            value
          }
        }
      }
    }
  }
`

// Shopify API client
export class ShopifyClient {
  private shop: string
  private accessToken: string

  constructor(shop: string, accessToken: string) {
    this.shop = shop
    this.accessToken = accessToken
  }

  private getApiUrl(): string {
    return `https://${this.shop}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}/graphql.json`
  }

  async graphql<T>(query: string, variables?: Record<string, unknown>): Promise<ShopifyGraphQLResponse<T>> {
    const response = await fetch(this.getApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getProducts(first: number = 50, after?: string) {
    const response = await this.graphql<{
      products: {
        edges: Array<{
          node: ShopifyProduct
        }>
        pageInfo: {
          hasNextPage: boolean
          endCursor: string
        }
      }
    }>(GET_PRODUCTS_QUERY, { first, after })

    if (response.errors) {
      throw new Error(`GraphQL errors: ${response.errors.map(e => e.message).join(', ')}`)
    }

    return response.data.products
  }

  async getProduct(id: string) {
    const response = await this.graphql<{
      product: ShopifyProduct
    }>(GET_PRODUCT_BY_ID_QUERY, { id })

    if (response.errors) {
      throw new Error(`GraphQL errors: ${response.errors.map(e => e.message).join(', ')}`)
    }

    return response.data.product
  }
}

// OAuth helpers
export function getShopifyOAuthUrl(shop: string, redirectUri: string): string {
  const scopes = 'read_products,read_product_listings'
  const clientId = process.env.SHOPIFY_API_KEY!
  
  const params = new URLSearchParams({
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    state: generateRandomState(),
  })

  return `https://${shop}.myshopify.com/admin/oauth/authorize?${params.toString()}`
}

export async function exchangeCodeForToken(
  shop: string,
  code: string,
  redirectUri: string
): Promise<string> {
  const clientId = process.env.SHOPIFY_API_KEY!
  const clientSecret = process.env.SHOPIFY_API_SECRET!

  const response = await fetch(`https://${shop}.myshopify.com/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    throw new Error(`OAuth token exchange failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

// Database helpers
export async function saveShop(shop: string, accessToken: string) {
  return db.shop.upsert({
    where: { domain: shop },
    update: { accessToken },
    create: {
      id: shop,
      domain: shop,
      accessToken,
    },
  })
}

export async function getShop(shop: string) {
  return db.shop.findUnique({
    where: { domain: shop },
  })
}

// Utility functions
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function getShopFromHost(host: string): string {
  // Extract shop domain from host like "shop-name.myshopify.com"
  const match = host.match(/^([^.]+)\.myshopify\.com$/)
  return match ? match[1] : host
}

/**
 * Get static access token from environment variables (for Custom App)
 */
export function getStaticAccessToken(): string | null {
  return process.env.SHOPIFY_ACCESS_TOKEN || null
}

/**
 * Create Shopify client using static access token
 */
export function createStaticShopifyClient(shop: string): ShopifyClient | null {
  const accessToken = getStaticAccessToken()
  if (!accessToken) {
    return null
  }
  return new ShopifyClient(shop, accessToken)
}