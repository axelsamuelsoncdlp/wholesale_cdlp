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

    // Generate Excel file
    const excelBuffer = generateExcelFromProducts(products as ShopifyProduct[])

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `linesheet-${config?.season || 'export'}-${timestamp}.xlsx`

    // Return Excel file
    return new NextResponse(excelBuffer, {
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
