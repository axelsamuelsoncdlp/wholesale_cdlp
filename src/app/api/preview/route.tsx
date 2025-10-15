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
    const pdfStream = await pdf(
      <LinesheetDocument products={products} config={config} />
    ).toBlob()

    // Convert blob to base64 for preview
    const arrayBuffer = await pdfStream.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    
    // Create a more compatible data URL
    const dataUrl = `data:application/pdf;base64,${base64}`

    return NextResponse.json({ 
      previewUrl: dataUrl,
      base64: base64,
      productCount: products.length,
      config: config,
      blobSize: arrayBuffer.byteLength
    })
  } catch (error) {
    console.error('Error generating PDF preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF preview', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
