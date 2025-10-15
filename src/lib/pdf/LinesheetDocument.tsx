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
    paddingBottom: 10,
    textAlign: 'center',
  },
  logo: {
    height: 40,
    width: 'auto',
    marginBottom: 10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  season: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'normal',
    fontWeight: 'bold',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  productCard: {
    marginBottom: 10,
    marginRight: 3,
    padding: 4,
    minHeight: 180,
    textAlign: 'left',
    width: '11%',
  },
  productImage: {
    width: '100%',
    height: 120,
    marginBottom: 6,
    objectFit: 'contain',
    alignSelf: 'center',
  },
  productTitle: {
    fontSize: 7,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'left',
    lineHeight: 1.1,
    textTransform: 'uppercase',
  },
  productHandle: {
    fontSize: 7,
    color: '#000000',
    marginBottom: 2,
    textAlign: 'left',
  },
  productDetails: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 6,
    fontWeight: 'bold',
    marginRight: 1,
  },
  detailValue: {
    fontSize: 6,
    color: '#000000',
  },
  price: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'left',
    marginBottom: 1,
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
  const availableWidth = 842 - 40 // Total width minus padding
  const marginBetweenCards = (config.productsPerRow - 1) * 3 // 3px margin between cards
  const cardWidth = (availableWidth - marginBetweenCards) / config.productsPerRow
  
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
                  <Text style={styles.price}>
                    Wholesale: {getProductPrice(product)}
                  </Text>
                )}

                {config.fieldToggles.msrpPrice && (
                  <Text style={styles.price}>
                    M.S.R.P.: {getProductPrice(product)}
                  </Text>
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
        <View style={styles.footer}>
          <Text style={{ fontSize: 10, color: '#000000', position: 'absolute', bottom: 20, left: 20 }}>
            Page: 2 of 16
          </Text>
          <Text style={{ fontSize: 10, color: '#000000', position: 'absolute', bottom: 20, left: 200 }}>
            {config.headerTitle}
          </Text>
          <Text style={{ fontSize: 10, color: '#000000', position: 'absolute', bottom: 20, right: 20 }}>
            POWERED BY NUORDER
          </Text>
        </View>
      </Page>
    </Document>
  )
}