import { LinesheetItem, LinesheetConfig } from '@/lib/types'

// Mock data for preview
const mockItems: LinesheetItem[] = [
  {
    productId: '1',
    title: 'ESSENTIAL COTTON T-SHIRT',
    styleNumber: 'ECT001',
    season: 'SS26',
    wholesale: '$12.50',
    msrp: '$25.00',
    sizes: 'XL - S',
    color: 'BLACK',
  },
  {
    productId: '2',
    title: 'PREMIUM DENIM JACKET',
    styleNumber: 'PDJ001',
    season: 'SS26',
    wholesale: '$44.50',
    msrp: '$89.00',
    sizes: 'L - S',
    color: 'DARK NAVY',
  },
  {
    productId: '3',
    title: 'CLASSIC WOOL SWEATER',
    styleNumber: 'CWS001',
    season: 'AW25',
    wholesale: '$32.50',
    msrp: '$65.00',
    sizes: 'XL - S',
    color: 'AZURE BLUE',
  },
  {
    productId: '4',
    title: 'SIGNATURE HOODIE',
    styleNumber: 'SH001',
    season: 'AW25',
    wholesale: '$35.00',
    msrp: '$70.00',
    sizes: 'XXL - S',
    color: 'BLACK+DARK NAVY',
  },
]

const mockConfig: LinesheetConfig = {
  headerTitle: 'CDLP SS26 MENS',
  subheader: 'MENS',
  currency: 'USD',
  priceSource: 'price_list',
  season: 'SS26',
  fieldToggles: {
    styleNumber: true,
    season: true,
    wholesale: true,
    msrp: true,
    sizes: true,
    color: true,
  },
  layoutStyle: 'two-column-compact',
  products: [],
}

export default function PreviewPage() {
  // Split items into two columns
  const leftColumnItems = mockItems.filter((_, index) => index % 2 === 0)
  const rightColumnItems = mockItems.filter((_, index) => index % 2 === 1)

  return (
    <div className="min-h-screen bg-white p-8 font-mono text-xs">
      {/* Header */}
      <div className="text-center mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {mockConfig.headerTitle}
        </h1>
        {mockConfig.subheader && (
          <p className="text-sm text-gray-600">{mockConfig.subheader}</p>
        )}
        {mockConfig.season && (
          <p className="text-xs text-gray-500 mt-1">{mockConfig.season}</p>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="flex gap-8">
        {/* Left Column */}
        <div className="flex-1 space-y-4">
          {leftColumnItems.map((item, index) => (
            <ProductCard key={`left-${index}`} item={item} config={mockConfig} />
          ))}
        </div>

        {/* Right Column */}
        <div className="flex-1 space-y-4">
          {rightColumnItems.map((item, index) => (
            <ProductCard key={`right-${index}`} item={item} config={mockConfig} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-right mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500">
        Page 1
      </div>
    </div>
  )
}

function ProductCard({ item, config }: { item: LinesheetItem; config: LinesheetConfig }) {
  const { fieldToggles } = config

  return (
    <div className="border-b border-gray-200 pb-3 mb-3">
      <h3 className="font-semibold text-gray-900 mb-2 uppercase">
        {item.title}
      </h3>
      
      {fieldToggles.styleNumber && item.styleNumber && (
        <div className="flex mb-1">
          <span className="w-16 text-gray-600">Style #:</span>
          <span className="text-gray-900">{item.styleNumber}</span>
        </div>
      )}
      
      {fieldToggles.season && item.season && (
        <div className="flex mb-1">
          <span className="w-16 text-gray-600">Season:</span>
          <span className="text-gray-900">{item.season}</span>
        </div>
      )}
      
      {fieldToggles.wholesale && item.wholesale && (
        <div className="flex mb-1">
          <span className="w-16 text-gray-600">Wholesale:</span>
          <span className="text-gray-900">{item.wholesale}</span>
        </div>
      )}
      
      {fieldToggles.msrp && item.msrp && (
        <div className="flex mb-1">
          <span className="w-16 text-gray-600">M.S.R.P.:</span>
          <span className="text-gray-900">{item.msrp}</span>
        </div>
      )}
      
      {fieldToggles.sizes && item.sizes && (
        <div className="flex mb-1">
          <span className="w-16 text-gray-600">Sizes:</span>
          <span className="text-gray-900">{item.sizes}</span>
        </div>
      )}
      
      {fieldToggles.color && item.color && (
        <div className="flex mb-1">
          <span className="w-16 text-gray-600">Color:</span>
          <span className="text-gray-900">{item.color}</span>
        </div>
      )}
    </div>
  )
}
