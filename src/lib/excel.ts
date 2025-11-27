import ExcelJS from 'exceljs'
import { ShopifyProduct } from '@/lib/shopify'
import fetch from 'node-fetch'


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

export async function generateExcelFromProducts(products: ShopifyProduct[]): Promise<ArrayBuffer> {
  console.log('Starting Excel generation for', products.length, 'products')
  
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Linesheet')
  
  // Define columns with headers
  worksheet.columns = [
    { header: 'Season', key: 'season', width: 12 },
    { header: 'Color', key: 'color', width: 15 },
    { header: 'Style Number', key: 'styleNumber', width: 18 },
    { header: 'Image', key: 'image', width: 22 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Wholesale (USD)', key: 'wholesale', width: 15 },
    { header: 'M.S.R.P. (USD)', key: 'msrp', width: 15 },
    { header: 'Division', key: 'division', width: 12 },
    { header: 'Department', key: 'department', width: 12 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Subcategory', key: 'subcategory', width: 15 },
    { header: 'Product Note', key: 'productNote', width: 20 },
    { header: 'Ship Start', key: 'shipStart', width: 12 },
    { header: 'Ship End', key: 'shipEnd', width: 12 },
    { header: 'Prebook', key: 'prebook', width: 10 },
    { header: 'Total Price (USD)', key: 'totalPrice', width: 15 },
    { header: 'Total Units', key: 'totalUnits', width: 12 },
    { header: 'Size 1', key: 'size1', width: 8 },
    { header: 'Qty 1', key: 'qty1', width: 8 },
    { header: 'Size 2', key: 'size2', width: 8 },
    { header: 'Qty 2', key: 'qty2', width: 8 },
    { header: 'Size 3', key: 'size3', width: 8 },
    { header: 'Qty 3', key: 'qty3', width: 8 },
    { header: 'Size 4', key: 'size4', width: 8 },
    { header: 'Qty 4', key: 'qty4', width: 8 },
    { header: 'Size 5', key: 'size5', width: 8 },
    { header: 'Qty 5', key: 'qty5', width: 8 },
    { header: 'Size 6', key: 'size6', width: 8 },
    { header: 'Qty 6', key: 'qty6', width: 8 },
    { header: 'Size 7', key: 'size7', width: 8 },
    { header: 'Qty 7', key: 'qty7', width: 8 },
  ]
  
  // Process each product
  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    console.log(`Processing product ${i + 1}/${products.length}:`, product.title)
    
    try {
      // Extract data from product
      const season = getMetafieldValue(product, 'season') || ''
      const color = getColorFromProduct(product) || ''
      const styleNumber = getMetafieldValue(product, 'style_number') || ''
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
      
      const rowIndex = i + 2 // +2 because row 1 is headers
      
      // Add product data to row
      const row = worksheet.addRow({
        season: season,
        color: color,
        styleNumber: styleNumber,
        image: '', // Will be handled separately
        name: name,
        wholesale: wholesalePrice,
        msrp: msrpPrice,
        division: division,
        department: department,
        category: category,
        subcategory: subcategory,
        productNote: productNote,
        shipStart: shipStart,
        shipEnd: shipEnd,
        prebook: prebook,
        totalPrice: totalPrice,
        totalUnits: totalUnits,
        size1: sizes[0] || '',
        qty1: quantities[0] || 0,
        size2: sizes[1] || '',
        qty2: quantities[1] || 0,
        size3: sizes[2] || '',
        qty3: quantities[2] || 0,
        size4: sizes[3] || '',
        qty4: quantities[3] || 0,
        size5: sizes[4] || '',
        qty5: quantities[4] || 0,
        size6: sizes[5] || '',
        qty6: quantities[5] || 0,
        size7: sizes[6] || '',
        qty7: quantities[6] || 0,
      })
      
      // Set row height for image (150px = 112.5 points)
      row.height = 112.5
      
      // Handle image
      if (product.images.edges.length > 0) {
        try {
          const imageUrl = product.images.edges[0].node.url
          console.log('Fetching image for', product.title, ':', imageUrl)
          
          const response = await fetch(imageUrl)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          const buffer = await response.buffer()
          console.log('Image downloaded, size:', buffer.length, 'bytes')
          
          // Convert to Node.js Buffer for exceljs compatibility using Uint8Array
          const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
          const nodeBuffer = Buffer.from(uint8Array)
          
          // Determine image extension from content type or URL
          const contentType = response.headers.get('content-type') || ''
          let extension: 'jpeg' | 'png' | 'gif' = 'jpeg'
          if (contentType.includes('png')) extension = 'png'
          else if (contentType.includes('gif')) extension = 'gif'
          // webp is not supported by exceljs, use jpeg as fallback
          
          // Type assertion needed due to Buffer type incompatibility between node-fetch and exceljs
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const imageId = workbook.addImage({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            buffer: nodeBuffer as any,
            extension: extension,
          })
          
          // Position image in Image column (column D, index 3) at 150x150 pixels
          worksheet.addImage(imageId, {
            tl: { col: 3, row: rowIndex - 1 },
            ext: { width: 150, height: 150 },
          })
          
          console.log(`Image embedded for product ${i + 1}:`, product.title)
          
        } catch (error) {
          console.error(`Error downloading image for product ${i + 1} (${product.title}):`, error)
          // Write "Image missing" if download fails
          worksheet.getCell(rowIndex, 4).value = 'Image missing'
        }
      } else {
        console.log(`No image for product ${i + 1}:`, product.title)
        worksheet.getCell(rowIndex, 4).value = 'Image missing'
      }
      
      console.log(`Successfully processed product ${i + 1}:`, product.title)
      
    } catch (error) {
      console.error(`Error processing product ${i + 1} (${product.title}):`, error)
      // Continue with next product instead of failing completely
      const rowIndex = i + 2
      const row = worksheet.addRow({
        season: '',
        color: '',
        styleNumber: '',
        image: '',
        name: product.title || 'Error processing product',
        wholesale: 0,
        msrp: 0,
        division: '',
        department: '',
        category: '',
        subcategory: '',
        productNote: 'Error processing this product',
        shipStart: '',
        shipEnd: '',
        prebook: '',
        totalPrice: 0,
        totalUnits: 0,
        size1: '',
        qty1: 0,
        size2: '',
        qty2: 0,
        size3: '',
        qty3: 0,
        size4: '',
        qty4: 0,
        size5: '',
        qty5: 0,
        size6: '',
        qty6: 0,
        size7: '',
        qty7: 0,
      })
      row.height = 112.5
      worksheet.getCell(rowIndex, 4).value = 'Image missing'
    }
  }
  
  console.log('Creating Excel workbook with', products.length, 'rows')
  
  try {
    console.log('Generating Excel buffer...')
    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()
    console.log('Excel buffer generated successfully')
    
    // Type assertion needed due to exceljs return type
    return buffer as unknown as ArrayBuffer
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
  return product.variants.edges.reduce((total) => {
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