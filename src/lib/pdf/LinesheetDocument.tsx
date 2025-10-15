import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { ShopifyProduct } from '@/lib/shopify'
import { LinesheetConfig } from '@/contexts/LinesheetContext'

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1pt solid #000000',
    paddingBottom: 10,
    textAlign: 'center',
  },
  logo: {
    width: 80,
    height: 40,
    marginBottom: 10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  season: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  productCard: {
    marginBottom: 15,
    marginRight: 10,
    border: '1pt solid #E5E5E5',
    borderRadius: 5,
    padding: 8,
    minHeight: 200,
  },
  productImage: {
    width: '100%',
    height: 120,
    marginBottom: 8,
    objectFit: 'cover',
  },
  productTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productHandle: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 6,
  },
  productDetails: {
    flexDirection: 'column',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  detailLabel: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 8,
  },
  price: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 8,
    color: '#666666',
  },
})

interface LinesheetDocumentProps {
  products: ShopifyProduct[]
  config: LinesheetConfig
}

export function LinesheetDocument({ products, config }: LinesheetDocumentProps) {
  const getProductPrice = (product: ShopifyProduct): string => {
    if (product.variants.edges.length > 0) {
      const variant = product.variants.edges[0].node
      return `${config.currency} ${parseFloat(variant.price).toFixed(2)}`
    }
    return 'N/A'
  }

  const getProductSizes = (product: ShopifyProduct): string => {
    const sizes = new Set<string>()
    product.variants.edges.forEach(edge => {
      edge.node.selectedOptions.forEach(option => {
        if (option.name.toLowerCase().includes('size')) {
          sizes.add(option.value)
        }
      })
    })
    return Array.from(sizes).join(', ') || 'One Size'
  }

  const getProductColors = (product: ShopifyProduct): string => {
    const colors = new Set<string>()
    product.variants.edges.forEach(edge => {
      edge.node.selectedOptions.forEach(option => {
        if (option.name.toLowerCase().includes('color')) {
          colors.add(option.value)
        }
      })
    })
    return Array.from(colors).join(', ') || 'Multiple'
  }

  const getProductSeason = (product: ShopifyProduct): string => {
    const seasonMetafield = product.metafields.edges.find(
      edge => edge.node.key === 'season'
    )
    return seasonMetafield?.node.value || config.season
  }

  const getProductStyleNumber = (product: ShopifyProduct): string => {
    const styleMetafield = product.metafields.edges.find(
      edge => edge.node.key === 'style_number'
    )
    return styleMetafield?.node.value || product.handle.toUpperCase()
  }

  // Calculate card width based on products per row (landscape A4 = 842px width)
  const cardWidth = `${(842 - 40 - (config.productsPerRow - 1) * 10) / config.productsPerRow}px`
  
  const dynamicStyles = StyleSheet.create({
    productCard: {
      ...styles.productCard,
      width: cardWidth,
    },
  })

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {config.logoUrl && (
            <Image
              style={styles.logo}
              src={config.logoUrl}
            />
          )}
          <Text style={styles.title}>{config.headerTitle}</Text>
          <Text style={styles.subtitle}>{config.subheader}</Text>
          <Text style={styles.season}>{config.season}</Text>
        </View>

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {products.map((product) => (
            <View key={product.id} style={dynamicStyles.productCard}>
              {/* Product Image */}
              {config.fieldToggles.images && product.images.edges.length > 0 && (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image
                  style={styles.productImage}
                  src={product.images.edges[0].node.url}
                />
              )}

              {/* Product Details */}
              <View style={styles.productDetails}>
                {config.fieldToggles.productName && (
                  <Text style={styles.productTitle}>{product.title}</Text>
                )}
                
                {config.fieldToggles.styleNumber && (
                  <Text style={styles.productHandle}>
                    Style: {getProductStyleNumber(product)}
                  </Text>
                )}

                {config.fieldToggles.season && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Season:</Text>
                    <Text style={styles.detailValue}>{getProductSeason(product)}</Text>
                  </View>
                )}

                {config.fieldToggles.wholesalePrice && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Wholesale:</Text>
                    <Text style={[styles.detailValue, styles.price]}>
                      {getProductPrice(product)}
                    </Text>
                  </View>
                )}

                {config.fieldToggles.msrpPrice && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>MSRP:</Text>
                    <Text style={[styles.detailValue, styles.price]}>
                      {getProductPrice(product)}
                    </Text>
                  </View>
                )}

                {config.fieldToggles.sizes && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Sizes:</Text>
                    <Text style={styles.detailValue}>{getProductSizes(product)}</Text>
                  </View>
                )}

                {config.fieldToggles.colors && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Colors:</Text>
                    <Text style={styles.detailValue}>{getProductColors(product)}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString()} • {products.length} products
        </Text>
      </Page>
    </Document>
  )
}