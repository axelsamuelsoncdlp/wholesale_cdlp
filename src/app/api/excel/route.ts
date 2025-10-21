import { NextRequest, NextResponse } from 'next/server'
import { generateExcelFromProducts } from '@/lib/excel'
import { ShopifyProduct } from '@/lib/shopify'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { products, config } = body

    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Products array is required' },
        { status: 400 }
      )
    }

    console.log('Starting Excel generation for', products.length, 'products')
    
    // Generate Excel file
    const excelBuffer = await generateExcelFromProducts(products as ShopifyProduct[])
    
    console.log('Excel generation completed, buffer size:', excelBuffer.length)

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `linesheet-${config?.season || 'export'}-${timestamp}.xlsx`

    console.log('Returning Excel file:', filename)

    // Return Excel file
    return new NextResponse(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error generating Excel file:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate Excel file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
