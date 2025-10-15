import { NextRequest, NextResponse } from 'next/server'
import { pdf } from '@react-pdf/renderer'
import { LinesheetDocument } from '@/lib/pdf/LinesheetDocument'
import { ShopifyProduct } from '@/lib/shopify'
import { LinesheetConfig } from '@/contexts/LinesheetContext'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { products, config }: { products: ShopifyProduct[], config: LinesheetConfig } = body

    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 })
    }

    if (!config) {
      return NextResponse.json({ error: 'No configuration provided' }, { status: 400 })
    }

    // Generate PDF
    const pdfBuffer = await pdf(
      <LinesheetDocument products={products} config={config} />
    ).toBuffer()

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="linesheet-${config.season}-${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
