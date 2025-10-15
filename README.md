# CDLP Linesheet Generator

A professional Shopify embedded app for generating wholesale linesheets from your Shopify products. Create beautifully formatted PDF catalogs that match your brand's aesthetic and include all the product information your wholesale customers need.

## Features

### 🎯 Core Functionality
- **Product Selection**: Search, filter, and multi-select products from your Shopify store
- **Drag & Drop Reordering**: Arrange products in your desired order with intuitive drag-and-drop
- **Field Customization**: Toggle visibility of Style #, Season, Wholesale, MSRP, Sizes, and Color fields
- **Layout Configuration**: Customize headers, pricing sources, currency, and seasonal information
- **Live Preview**: See exactly how your linesheet will look before generating the PDF
- **Professional PDF Generation**: High-quality, print-ready PDFs with proper pagination and typography

### 🎨 Design & Branding
- **Two-Column Compact Layout**: Matches professional wholesale industry standards
- **Custom Headers**: Set your brand title, season, and subheader
- **Consistent Typography**: Uses Inter font for professional, readable output
- **Field Labels**: Proper formatting with "Style #:", "Season:", "Wholesale:", "M.S.R.P.:", "Sizes:", "Color:" labels
- **Page Numbers**: Automatic pagination with "Page X" footer

### 💼 Business Features
- **Multiple Price Sources**: Support for B2B price lists, metafields, or variant pricing
- **Currency Support**: USD, EUR, GBP, SEK, NOK, DKK with proper formatting
- **Size Aggregation**: Smart size range detection (e.g., "XXXL - XS") or comma-separated lists
- **Color Handling**: Multi-color products displayed as "BLACK+DARK NAVY+WHITE"
- **Preset Management**: Save and reuse linesheet configurations
- **Render History**: Track and re-download previously generated PDFs

## Tech Stack

- **Framework**: Next.js 15 with App Router and TypeScript
- **UI Library**: Tailwind CSS + shadcn/ui components
- **Shopify Integration**: App Bridge, Admin GraphQL API, OAuth
- **Database**: Supabase Postgres with Prisma ORM
- **PDF Generation**: @react-pdf/renderer for serverless-friendly PDF creation
- **Deployment**: Vercel with edge functions

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Shopify Partners account
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shopify-linesheet-app
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Shopify API credentials and database URL.

4. **Setup database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Shopify App Setup

1. Create a new app in [Shopify Partners Dashboard](https://partners.shopify.com)
2. Set the app URL to your deployment URL
3. Add redirect URL: `https://your-domain.com/auth/callback`
4. Copy API key and secret to your environment variables

## Usage

### Creating Your First Linesheet

1. **Select Products**: Browse and select products from your Shopify store
2. **Configure Layout**: Set headers, pricing, and field visibility
3. **Preview**: Review your linesheet layout in real-time
4. **Generate PDF**: Download your professional linesheet

### Field Configuration

- **Style #**: Product SKU or style number from metafields
- **Season**: Seasonal collection information
- **Wholesale**: B2B pricing from price lists or metafields
- **M.S.R.P.**: Manufacturer's suggested retail price
- **Sizes**: Smart aggregation of available sizes
- **Color**: Product color information with multi-color support

### Pricing Sources

- **B2B Price Lists**: Use Shopify Plus wholesale pricing
- **Metafields**: Custom pricing fields in product metafields
- **Variant Price**: Standard product variant pricing

## Project Structure

```
├── app/
│   ├── (public)/auth/callback/     # OAuth callback
│   ├── (shop)/app/                 # Main app pages
│   │   ├── page.tsx               # Dashboard
│   │   ├── products/page.tsx      # Product selection
│   │   ├── layout/page.tsx        # Layout configuration
│   │   └── history/page.tsx       # Render history
│   ├── api/render/                 # PDF generation API
│   └── render/preview/             # HTML preview
├── src/
│   ├── components/ui/              # shadcn/ui components
│   └── lib/
│       ├── shopify.ts             # Shopify API client
│       ├── mapToLinesheet.ts      # Data transformation
│       ├── pdf/LinesheetDocument.tsx # PDF component
│       └── types.ts               # TypeScript definitions
└── prisma/
    └── schema.prisma              # Database schema
```

## API Reference

### PDF Generation Endpoint

**POST** `/api/render`

Generate a linesheet PDF from preset or direct data.

**Request Body:**
```json
{
  "presetId": "string", // Optional: Use saved preset
  "items": [...],       // Optional: Direct product data
  "config": {...}       // Optional: Direct configuration
}
```

**Response:** PDF file download

### Data Types

```typescript
interface LinesheetItem {
  productId: string
  title: string
  styleNumber?: string
  season?: string
  wholesale?: string
  msrp?: string
  sizes?: string
  color?: string
  image?: { url: string; alt?: string }
}

interface LinesheetConfig {
  headerTitle: string
  subheader?: string
  currency: string
  priceSource: 'price_list' | 'metafield' | 'variant_price'
  season?: string
  fieldToggles: {
    styleNumber: boolean
    season: boolean
    wholesale: boolean
    msrp: boolean
    sizes: boolean
    color: boolean
  }
  layoutStyle: 'two-column-compact'
  products: Array<{
    productId: string
    variantIds?: string[]
    order: number
  }>
}
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma db push

# Generate client
npx prisma generate
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the [documentation](./docs/)

## Roadmap

### Upcoming Features
- [ ] Cover page with hero images
- [ ] Category/collection sections
- [ ] CSV export functionality
- [ ] Shareable signed URLs
- [ ] Advanced filtering options
- [ ] Bulk operations
- [ ] Custom branding options
- [ ] Multi-language support

### Performance Improvements
- [ ] Playwright engine for pixel-perfect rendering
- [ ] Advanced caching strategies
- [ ] Edge function optimization
- [ ] Image optimization pipeline

---

Built with ❤️ for the wholesale fashion industry