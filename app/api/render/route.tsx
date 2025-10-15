import React from 'react'
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import LinesheetDocument from '@/lib/pdf/LinesheetDocument'
import { db } from '@/lib/db'
import { LinesheetItem, LinesheetConfig } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { presetId, items, config } = body

    let linesheetItems: LinesheetItem[]
    let linesheetConfig: LinesheetConfig

    if (presetId) {
      // Fetch preset from database
      const preset = await db.linesheetPreset.findUnique({
        where: { id: presetId },
        include: { shop: true },
      })

      if (!preset) {
        return NextResponse.json({ error: 'Preset not found' }, { status: 404 })
      }

      // Parse preset data
      const presetProducts = preset.products as Array<{
        productId: string
        variantIds?: string[]
        order: number
      }>
      const presetFieldToggles = preset.fieldToggles as {
        styleNumber: boolean
        season: boolean
        wholesale: boolean
        msrp: boolean
        sizes: boolean
        color: boolean
      }

      // TODO: Fetch actual product data from Shopify
      // For now, use mock data
      linesheetItems = generateMockItems(presetProducts.length)
      
      linesheetConfig = {
        headerTitle: preset.headerTitle || 'Linesheet',
        subheader: '',
        currency: preset.currency,
        priceSource: preset.priceSource as 'price_list' | 'metafield' | 'variant_price',
        season: preset.season || undefined,
        fieldToggles: presetFieldToggles,
        layoutStyle: 'two-column-compact',
        products: presetProducts,
      }
    } else if (items && config) {
      // Use provided data directly
      linesheetItems = items
      linesheetConfig = config
    } else {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <LinesheetDocument items={linesheetItems} config={linesheetConfig} />
    )

    // Create filename
    const timestamp = new Date().toISOString().split('T')[0]
    const safeTitle = linesheetConfig.headerTitle
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase()
    const filename = `Linesheet_${safeTitle}_${timestamp}.pdf`

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}

// Mock data generator for development
function generateMockItems(count: number): LinesheetItem[] {
  const mockProducts = [
    {
      title: 'ESSENTIAL COTTON T-SHIRT',
      styleNumber: 'ECT001',
      season: 'SS26',
      wholesale: '$12.50',
      msrp: '$25.00',
      sizes: 'XL - S',
      color: 'BLACK',
    },
    {
      title: 'PREMIUM DENIM JACKET',
      styleNumber: 'PDJ001',
      season: 'SS26',
      wholesale: '$44.50',
      msrp: '$89.00',
      sizes: 'L - S',
      color: 'DARK NAVY',
    },
    {
      title: 'CLASSIC WOOL SWEATER',
      styleNumber: 'CWS001',
      season: 'AW25',
      wholesale: '$32.50',
      msrp: '$65.00',
      sizes: 'XL - S',
      color: 'AZURE BLUE',
    },
    {
      title: 'SIGNATURE HOODIE',
      styleNumber: 'SH001',
      season: 'AW25',
      wholesale: '$35.00',
      msrp: '$70.00',
      sizes: 'XXL - S',
      color: 'BLACK+DARK NAVY',
    },
    {
      title: 'PERFORMANCE SHORTS',
      styleNumber: 'PS001',
      season: 'SS26',
      wholesale: '$18.00',
      msrp: '$36.00',
      sizes: 'L - S',
      color: 'NAVY+WHITE',
    },
  ]

  return Array.from({ length: count }, (_, index) => {
    const product = mockProducts[index % mockProducts.length]
    return {
      productId: `mock-${index}`,
      title: product.title,
      styleNumber: product.styleNumber,
      season: product.season,
      wholesale: product.wholesale,
      msrp: product.msrp,
      sizes: product.sizes,
      color: product.color,
    }
  })
}
