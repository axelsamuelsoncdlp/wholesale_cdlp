import * as XLSX from 'xlsx'
import { ShopifyProduct } from '@/lib/shopify'
import fetch from 'node-fetch'

// Helper function to fetch image as base64
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    return `data:${contentType};base64,${base64}`
  } catch (error) {
    console.error('Error fetching image:', error)
    return null
  }
}

export interface ExcelRow {
  Season: string
  Color: string
  'Style Number': string
  Image: string
  Name: string
  'Wholesale (USD)': number
  'M.S.R.P. (USD)': number
  Division: string
  Department: string
  Category: string
  Subcategory: string
  'Product Note': string
  'Ship Start': string
  'Ship End': string
  Prebook: string
  'Total Price (USD)': number
  'Total Units': number
  'Size 1': string
  'Qty 1': number
  'Size 2': string
  'Qty 2': number
  'Size 3': string
  'Qty 3': number
  'Size 4': string
  'Qty 4': number
  'Size 5': string
  'Qty 5': number
  'Size 6': string
  'Qty 6': number
  'Size 7': string
  'Qty 7': number
}

export async function generateExcelFromProducts(products: ShopifyProduct[]): Promise<Buffer> {
  console.log('Starting Excel generation for', products.length, 'products')
  
  // Convert products to Excel rows
  const excelRows: ExcelRow[] = []
  
  // Process products and fetch images
  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    console.log(`Processing product ${i + 1}/${products.length}:`, product.title)
    
    try {
      // Extract data from product
      const season = getMetafieldValue(product, 'season') || ''
      const color = getColorFromProduct(product) || ''
      const styleNumber = getMetafieldValue(product, 'style_number') || ''
      
      // Handle image - fetch as base64 if URL exists
      let imageData = ''
      if (product.images.edges.length > 0) {
        const imageUrl = product.images.edges[0].node.url
        console.log('Fetching image for', product.title, ':', imageUrl)
        const base64Image = await fetchImageAsBase64(imageUrl)
        imageData = base64Image || imageUrl // Fallback to URL if base64 fails
        console.log('Image data length:', imageData.length)
      }
    
    const name = product.title
    const wholesalePrice = getWholesalePrice(product)
    const msrpPrice = getMSRPPrice(product)
    const division = getMetafieldValue(product, 'division') || ''
    const department = getMetafieldValue(product, 'department') || ''
    const category = product.productType || ''
    const subcategory = getMetafieldValue(product, 'subcategory') || ''
    const productNote = getMetafieldValue(product, 'product_note') || ''
    const shipStart = getMetafieldValue(product, 'ship_start') || ''
    const shipEnd = getMetafieldValue(product, 'ship_end') || ''
    const prebook = getMetafieldValue(product, 'prebook') || ''
    
    // Calculate totals
    const totalPrice = wholesalePrice
    const totalUnits = getTotalUnits(product)
    
    // Extract sizes and quantities
    const sizes = getSizesFromProduct(product)
    const quantities = getQuantitiesFromProduct(product)
    
    excelRows.push({
      Season: season,
      Color: color,
      'Style Number': styleNumber,
      Image: imageData,
      Name: name,
      'Wholesale (USD)': wholesalePrice,
      'M.S.R.P. (USD)': msrpPrice,
      Division: division,
      Department: department,
      Category: category,
      Subcategory: subcategory,
      'Product Note': productNote,
      'Ship Start': shipStart,
      'Ship End': shipEnd,
      Prebook: prebook,
      'Total Price (USD)': totalPrice,
      'Total Units': totalUnits,
      'Size 1': sizes[0] || '',
      'Qty 1': quantities[0] || 0,
      'Size 2': sizes[1] || '',
      'Qty 2': quantities[1] || 0,
      'Size 3': sizes[2] || '',
      'Qty 3': quantities[2] || 0,
      'Size 4': sizes[3] || '',
      'Qty 4': quantities[3] || 0,
      'Size 5': sizes[4] || '',
      'Qty 5': quantities[4] || 0,
      'Size 6': sizes[5] || '',
      'Qty 6': quantities[5] || 0,
      'Size 7': sizes[6] || '',
      'Qty 7': quantities[6] || 0,
    })
    
    console.log(`Successfully processed product ${i + 1}:`, product.title)
    
    } catch (error) {
      console.error(`Error processing product ${i + 1} (${product.title}):`, error)
      // Continue with next product instead of failing completely
      excelRows.push({
        Season: '',
        Color: '',
        'Style Number': '',
        Image: '',
        Name: product.title || 'Error processing product',
        'Wholesale (USD)': 0,
        'M.S.R.P. (USD)': 0,
        Division: '',
        Department: '',
        Category: '',
        Subcategory: '',
        'Product Note': 'Error processing this product',
        'Ship Start': '',
        'Ship End': '',
        Prebook: '',
        'Total Price (USD)': 0,
        'Total Units': 0,
        'Size 1': '',
        'Qty 1': 0,
        'Size 2': '',
        'Qty 2': 0,
        'Size 3': '',
        'Qty 3': 0,
        'Size 4': '',
        'Qty 4': 0,
        'Size 5': '',
        'Qty 5': 0,
        'Size 6': '',
        'Qty 6': 0,
        'Size 7': '',
        'Qty 7': 0,
      })
    }
  }

  console.log('Creating Excel workbook with', excelRows.length, 'rows')
  
  try {
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelRows)

    // Set column widths
    const columnWidths = [
      { wch: 10 }, // Season
      { wch: 12 }, // Color
      { wch: 15 }, // Style Number
      { wch: 30 }, // Image (wider for images)
      { wch: 25 }, // Name
      { wch: 15 }, // Wholesale
      { wch: 15 }, // MSRP
      { wch: 12 }, // Division
      { wch: 12 }, // Department
      { wch: 15 }, // Category
      { wch: 15 }, // Subcategory
      { wch: 20 }, // Product Note
      { wch: 12 }, // Ship Start
      { wch: 12 }, // Ship End
      { wch: 10 }, // Prebook
      { wch: 15 }, // Total Price
      { wch: 12 }, // Total Units
      { wch: 8 },  // Size 1
      { wch: 8 },  // Qty 1
      { wch: 8 },  // Size 2
      { wch: 8 },  // Qty 2
      { wch: 8 },  // Size 3
      { wch: 8 },  // Qty 3
      { wch: 8 },  // Size 4
      { wch: 8 },  // Qty 4
      { wch: 8 },  // Size 5
      { wch: 8 },  // Qty 5
      { wch: 8 },  // Size 6
      { wch: 8 },  // Qty 6
      { wch: 8 },  // Size 7
      { wch: 8 },  // Qty 7
    ]
    
    worksheet['!cols'] = columnWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Linesheet')

    console.log('Generating Excel buffer...')
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    console.log('Excel buffer generated successfully, size:', buffer.length, 'bytes')
    
    return buffer
  } catch (error) {
    console.error('Error creating Excel workbook:', error)
    throw new Error(`Failed to create Excel workbook: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Helper functions
function getMetafieldValue(product: ShopifyProduct, key: string): string {
  const metafield = product.metafields.edges.find(edge => edge.node.key === key)
  return metafield?.node.value || ''
}

function getColorFromProduct(product: ShopifyProduct): string {
  // Try to get color from metafield first
  const colorMetafield = getMetafieldValue(product, 'color')
  if (colorMetafield) return colorMetafield
  
  // Try to get color from variant options
  if (product.variants.edges.length > 0) {
    const colorOption = product.variants.edges[0].node.selectedOptions.find(
      option => option.name.toLowerCase() === 'color'
    )
    if (colorOption) return colorOption.value
  }
  
  return ''
}

function getWholesalePrice(product: ShopifyProduct): number {
  // Try to get wholesale price from metafield
  const wholesaleMetafield = getMetafieldValue(product, 'wholesale_price')
  if (wholesaleMetafield) {
    const price = parseFloat(wholesaleMetafield)
    if (!isNaN(price)) return price
  }
  
  // Fallback to variant price
  if (product.variants.edges.length > 0) {
    const price = parseFloat(product.variants.edges[0].node.price)
    return isNaN(price) ? 0 : price
  }
  
  return 0
}

function getMSRPPrice(product: ShopifyProduct): number {
  // Try to get MSRP from metafield
  const msrpMetafield = getMetafieldValue(product, 'msrp_price')
  if (msrpMetafield) {
    const price = parseFloat(msrpMetafield)
    if (!isNaN(price)) return price
  }
  
  // Fallback to compareAtPrice
  if (product.variants.edges.length > 0) {
    const comparePrice = product.variants.edges[0].node.compareAtPrice
    if (comparePrice) {
      const price = parseFloat(comparePrice)
      return isNaN(price) ? 0 : price
    }
  }
  
  return 0
}

function getTotalUnits(product: ShopifyProduct): number {
  // Sum up quantities from all variants
  return product.variants.edges.reduce((total, _variant) => {
    // For now, assume 1 unit per variant (could be enhanced with inventory data)
    return total + 1
  }, 0)
}

function getSizesFromProduct(product: ShopifyProduct): string[] {
  const sizes: string[] = []
  
  // Extract sizes from variant options
  product.variants.edges.forEach(variant => {
    const sizeOption = variant.node.selectedOptions.find(
      option => option.name.toLowerCase() === 'size'
    )
    if (sizeOption && !sizes.includes(sizeOption.value)) {
      sizes.push(sizeOption.value)
    }
  })
  
  return sizes.slice(0, 7) // Limit to 7 sizes
}

function getQuantitiesFromProduct(product: ShopifyProduct): number[] {
  const quantities: number[] = []
  
  // For now, assume 1 quantity per variant
  // This could be enhanced with actual inventory data
  product.variants.edges.forEach(() => {
    quantities.push(1)
  })
  
  return quantities.slice(0, 7) // Limit to 7 quantities
}
