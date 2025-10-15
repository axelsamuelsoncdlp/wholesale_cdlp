// Simple test script to verify PDF generation
const { renderToBuffer } = require('@react-pdf/renderer')
const fs = require('fs')
const path = require('path')

// Mock React components for testing
const React = require('react')

// Simple test document
const TestDocument = () => React.createElement('Document', null,
  React.createElement('Page', { size: 'A4', style: { padding: 40, fontFamily: 'Helvetica' } },
    React.createElement('Text', { style: { fontSize: 24, marginBottom: 20 } }, 'Test Linesheet'),
    React.createElement('Text', { style: { fontSize: 12, marginBottom: 10 } }, 'Product Name: ESSENTIAL COTTON T-SHIRT'),
    React.createElement('Text', { style: { fontSize: 12, marginBottom: 10 } }, 'Style #: ECT001'),
    React.createElement('Text', { style: { fontSize: 12, marginBottom: 10 } }, 'Season: SS26'),
    React.createElement('Text', { style: { fontSize: 12, marginBottom: 10 } }, 'Wholesale: $12.50'),
    React.createElement('Text', { style: { fontSize: 12, marginBottom: 10 } }, 'M.S.R.P.: $25.00'),
    React.createElement('Text', { style: { fontSize: 12, marginBottom: 10 } }, 'Sizes: XL - S'),
    React.createElement('Text', { style: { fontSize: 12 } }, 'Color: BLACK')
  )
)

async function testPDF() {
  try {
    console.log('Generating test PDF...')
    const buffer = await renderToBuffer(TestDocument())
    
    const outputPath = path.join(__dirname, 'test-output.pdf')
    fs.writeFileSync(outputPath, buffer)
    
    console.log('✅ Test PDF generated successfully!')
    console.log(`📄 Output saved to: ${outputPath}`)
    console.log(`📊 File size: ${(buffer.length / 1024).toFixed(2)} KB`)
  } catch (error) {
    console.error('❌ PDF generation failed:', error)
  }
}

testPDF()
