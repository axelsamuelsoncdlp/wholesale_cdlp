export type LinesheetItem = {
  productId: string
  title: string
  styleNumber?: string // from SKU or metafield
  season?: string
  wholesale?: string
  msrp?: string
  sizes?: string // "XXXL - XS" or "S, M, L"
  color?: string // "BLACK", "AZURE BLUE"
  image?: { url: string; alt?: string }
}

export type LinesheetConfig = {
  headerTitle: string
  subheader?: string
  currency: string
  priceSource: 'price_list' | 'metafield' | 'variant_price'
  season?: string
  fieldToggles: {
    styleNumber: boolean
    season: boolean
    wholesale: boolean
    msrp: boolean
    sizes: boolean
    color: boolean
  }
  layoutStyle: 'two-column-compact'
  products: Array<{
    productId: string
    variantIds?: string[]
    order: number
  }>
}

export type ShopifyProduct = {
  id: string
  title: string
  handle: string
  images: Array<{
    url: string
    altText?: string
  }>
  variants: Array<{
    id: string
    sku?: string
    price: string
    compareAtPrice?: string
    selectedOptions: Array<{
      name: string
      value: string
    }>
  }>
  metafields: Array<{
    namespace: string
    key: string
    value: string
  }>
}

export type ShopifyPriceList = {
  id: string
  name: string
  currency: string
  prices: Array<{
    variantId: string
    price: string
  }>
}
