import { LinesheetItem, ShopifyProduct, ShopifyPriceList } from './types'

export function mapShopifyProductToLinesheetItem(
  product: ShopifyProduct,
  priceList?: ShopifyPriceList,
  config?: {
    currency?: string
    priceSource?: 'price_list' | 'metafield' | 'variant_price'
  }
): LinesheetItem {
  // Extract style number from SKU or metafield
  const styleNumber = getStyleNumber(product)
  
  // Extract season from metafields
  const season = getSeason(product)
  
  // Extract color information
  const color = getColor(product)
  
  // Extract sizes
  const sizes = getSizes(product)
  
  // Get pricing
  const { wholesale, msrp } = getPricing(product, priceList, config)
  
  // Get first image
  const image = product.images[0] ? {
    url: product.images[0].url,
    alt: product.images[0].altText || product.title
  } : undefined

  return {
    productId: product.id,
    title: product.title.toUpperCase(),
    styleNumber,
    season,
    wholesale,
    msrp,
    sizes,
    color,
    image,
  }
}

function getStyleNumber(product: ShopifyProduct): string | undefined {
  // Try to get from SKU first
  const skuVariant = product.variants.find(v => v.sku)
  if (skuVariant?.sku) {
    return skuVariant.sku
  }

  // Try metafield
  const styleMetafield = product.metafields.find(m => 
    m.key === 'style_number' || m.key === 'style'
  )
  if (styleMetafield?.value) {
    return styleMetafield.value
  }

  return undefined
}

function getSeason(product: ShopifyProduct): string | undefined {
  const seasonMetafield = product.metafields.find(m => 
    m.key === 'season' || m.key === 'collection'
  )
  return seasonMetafield?.value
}

function getColor(product: ShopifyProduct): string | undefined {
  // Get all unique colors from variant options
  const colors = new Set<string>()
  
  product.variants.forEach(variant => {
    variant.selectedOptions.forEach(option => {
      if (option.name.toLowerCase() === 'color') {
        colors.add(option.value.toUpperCase())
      }
    })
  })

  if (colors.size === 0) {
    // Try metafield
    const colorMetafield = product.metafields.find(m => 
      m.key === 'color' || m.key === 'colors'
    )
    if (colorMetafield?.value) {
      return colorMetafield.value.toUpperCase()
    }
    return undefined
  }

  return Array.from(colors).join('+')
}

function getSizes(product: ShopifyProduct): string | undefined {
  const sizes = new Set<string>()
  
  product.variants.forEach(variant => {
    variant.selectedOptions.forEach(option => {
      if (option.name.toLowerCase() === 'size') {
        sizes.add(option.value.toUpperCase())
      }
    })
  })

  if (sizes.size === 0) {
    // Try metafield
    const sizeMetafield = product.metafields.find(m => 
      m.key === 'sizes' || m.key === 'size'
    )
    if (sizeMetafield?.value) {
      return sizeMetafield.value
    }
    return undefined
  }

  const sizeArray = Array.from(sizes)
  
  // Check if sizes are sequential (XS, S, M, L, XL, XXL, XXXL)
  const sizeOrder = ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL']
  const sortedSizes = sizeArray.sort((a, b) => {
    const aIndex = sizeOrder.indexOf(a)
    const bIndex = sizeOrder.indexOf(b)
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  // If we have a range, format it as "XXXL - XS"
  if (sortedSizes.length > 1) {
    const first = sortedSizes[0]
    const last = sortedSizes[sortedSizes.length - 1]
    
    // Check if it's a reasonable range (not too many gaps)
    const firstIndex = sizeOrder.indexOf(first)
    const lastIndex = sizeOrder.indexOf(last)
    
    if (firstIndex !== -1 && lastIndex !== -1 && (lastIndex - firstIndex) <= 8) {
      return `${last} - ${first}`
    }
  }

  return sortedSizes.join(', ')
}

function getPricing(
  product: ShopifyProduct,
  priceList?: ShopifyPriceList,
  config?: {
    currency?: string
    priceSource?: 'price_list' | 'metafield' | 'variant_price'
  }
): { wholesale?: string; msrp?: string } {
  const currency = config?.currency || 'USD'
  const priceSource = config?.priceSource || 'variant_price'
  
  let wholesale: string | undefined
  let msrp: string | undefined

  // Get MSRP (compare at price or metafield)
  const msrpMetafield = product.metafields.find(m => 
    m.key === 'msrp' || m.key === 'compare_price'
  )
  
  if (msrpMetafield?.value) {
    msrp = formatPrice(msrpMetafield.value, currency)
  } else {
    // Use compare at price from variants
    const compareAtPrice = product.variants.find(v => v.compareAtPrice)
    if (compareAtPrice?.compareAtPrice) {
      msrp = formatPrice(compareAtPrice.compareAtPrice, currency)
    }
  }

  // Get wholesale price based on source
  switch (priceSource) {
    case 'price_list':
      if (priceList) {
        const priceListPrice = priceList.prices.find(p => 
          product.variants.some(v => v.id === p.variantId)
        )
        if (priceListPrice) {
          wholesale = formatPrice(priceListPrice.price, currency)
        }
      }
      break
      
    case 'metafield':
      const wholesaleMetafield = product.metafields.find(m => 
        m.key === 'wholesale' || m.key === 'wholesale_price'
      )
      if (wholesaleMetafield?.value) {
        wholesale = formatPrice(wholesaleMetafield.value, currency)
      }
      break
      
    case 'variant_price':
    default:
      // Use the first variant's price as wholesale
      if (product.variants[0]?.price) {
        wholesale = formatPrice(product.variants[0].price, currency)
      }
      break
  }

  return { wholesale, msrp }
}

function formatPrice(price: string, currency: string): string {
  const numPrice = parseFloat(price)
  if (isNaN(numPrice)) return price

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  })

  return formatter.format(numPrice)
}
