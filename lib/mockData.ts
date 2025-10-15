import { LinesheetItem } from './types'

export const mockLinesheetItems: LinesheetItem[] = [
  {
    productId: '1',
    title: 'ESSENTIAL COTTON T-SHIRT',
    styleNumber: 'ECT001',
    season: 'SS26',
    wholesale: '$12.50',
    msrp: '$25.00',
    sizes: 'XL - S',
    color: 'BLACK',
    image: {
      url: '/placeholder-product.jpg',
      alt: 'Essential Cotton T-Shirt',
    },
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
    image: {
      url: '/placeholder-product.jpg',
      alt: 'Premium Denim Jacket',
    },
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
    image: {
      url: '/placeholder-product.jpg',
      alt: 'Classic Wool Sweater',
    },
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
    image: {
      url: '/placeholder-product.jpg',
      alt: 'Signature Hoodie',
    },
  },
  {
    productId: '5',
    title: 'PERFORMANCE SHORTS',
    styleNumber: 'PS001',
    season: 'SS26',
    wholesale: '$18.00',
    msrp: '$36.00',
    sizes: 'L - S',
    color: 'NAVY+WHITE',
    image: {
      url: '/placeholder-product.jpg',
      alt: 'Performance Shorts',
    },
  },
  {
    productId: '6',
    title: 'LUXURY CASHMERE CARDIGAN',
    styleNumber: 'LCC001',
    season: 'AW25',
    wholesale: '$85.00',
    msrp: '$170.00',
    sizes: 'XXXL - XS',
    color: 'CHARCOAL',
    image: {
      url: '/placeholder-product.jpg',
      alt: 'Luxury Cashmere Cardigan',
    },
  },
  {
    productId: '7',
    title: 'ATHLETIC JOGGER PANTS',
    styleNumber: 'AJP001',
    season: 'SS26',
    wholesale: '$28.00',
    msrp: '$56.00',
    sizes: 'XL - S',
    color: 'HEATHER GRAY',
    image: {
      url: '/placeholder-product.jpg',
      alt: 'Athletic Jogger Pants',
    },
  },
  {
    productId: '8',
    title: 'MINIMALIST POLO SHIRT',
    styleNumber: 'MPS001',
    season: 'SS26',
    wholesale: '$22.00',
    msrp: '$44.00',
    sizes: 'L - S',
    color: 'WHITE+NAVY',
    image: {
      url: '/placeholder-product.jpg',
      alt: 'Minimalist Polo Shirt',
    },
  },
  {
    productId: '9',
    title: 'WINTER COAT',
    styleNumber: 'WC001',
    season: 'AW25',
    wholesale: '$125.00',
    msrp: '$250.00',
    sizes: 'XXL - S',
    color: 'BLACK',
    image: {
      url: '/placeholder-product.jpg',
      alt: 'Winter Coat',
    },
  },
  {
    productId: '10',
    title: 'SUMMER LINEN SHIRT',
    styleNumber: 'SLS001',
    season: 'SS26',
    wholesale: '$38.00',
    msrp: '$76.00',
    sizes: 'XL - S',
    color: 'LIGHT BLUE+WHITE',
    image: {
      url: '/placeholder-product.jpg',
      alt: 'Summer Linen Shirt',
    },
  },
]

export const mockShopifyProducts = [
  {
    id: 'gid://shopify/Product/1',
    title: 'Essential Cotton T-Shirt',
    handle: 'essential-cotton-tshirt',
    images: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0000/0000/0000/products/tshirt.jpg',
        altText: 'Essential Cotton T-Shirt',
      },
    ],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/1',
        sku: 'ECT001',
        price: '25.00',
        compareAtPrice: '30.00',
        selectedOptions: [
          { name: 'Size', value: 'S' },
          { name: 'Color', value: 'Black' },
        ],
      },
      {
        id: 'gid://shopify/ProductVariant/2',
        sku: 'ECT002',
        price: '25.00',
        compareAtPrice: '30.00',
        selectedOptions: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'Black' },
        ],
      },
    ],
    metafields: [
      {
        namespace: 'custom',
        key: 'season',
        value: 'SS26',
      },
      {
        namespace: 'custom',
        key: 'style_number',
        value: 'ECT001',
      },
      {
        namespace: 'custom',
        key: 'wholesale_price',
        value: '12.50',
      },
    ],
  },
]

export const mockPriceLists = [
  {
    id: 'gid://shopify/PriceList/1',
    name: 'Wholesale US',
    currency: 'USD',
    prices: [
      {
        variantId: 'gid://shopify/ProductVariant/1',
        price: '12.50',
      },
      {
        variantId: 'gid://shopify/ProductVariant/2',
        price: '12.50',
      },
    ],
  },
]
