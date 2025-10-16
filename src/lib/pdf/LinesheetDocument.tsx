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
    height: 30,
    width: 'auto',
    marginBottom: 8,
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
    flexDirection: 'column',
  },
  productRow: {
    flexDirection: 'row',
    margin: 0,
    padding: 0,
  },
  productCard: {
    margin: 0,
    padding: 0,
    minHeight: 160,
    textAlign: 'left',
    position: 'relative',
    border: '1px solid red',
  },
  productImage: {
    width: 80,
    height: 80,
    margin: 0,
    padding: 0,
    objectFit: 'cover',
    objectPosition: 'left center',
    position: 'absolute',
    top: 0,
    left: 0,
    border: '1px solid blue',
  },
  productTitle: {
    fontSize: 6,
    fontWeight: 'bold',
    margin: 0,
    padding: 0,
    textAlign: 'left',
    lineHeight: 1.0,
    textTransform: 'uppercase',
  },
  productHandle: {
    fontSize: 6,
    color: '#000000',
    margin: 0,
    padding: 0,
    textAlign: 'left',
  },
  productDetails: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 0,
    margin: 0,
    width: 80,
    position: 'absolute',
    top: 80,
    left: 0,
    border: '1px solid green',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    margin: 0,
    padding: 0,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontSize: 5,
    fontWeight: 'bold',
    margin: 0,
    padding: 0,
    flexShrink: 0,
  },
  detailValue: {
    fontSize: 5,
    color: '#000000',
    margin: 0,
    padding: 0,
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  price: {
    fontSize: 5,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'left',
    margin: 0,
    padding: 0,
    flexWrap: 'wrap',
    maxWidth: '100%',
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

  const productsPerRow = config.productsPerRow || 8
  const productsPerPage = productsPerRow * 2 // 2 rows per page
  
  const dynamicStyles = StyleSheet.create({
    productCard: {
      ...styles.productCard,
      width: `${100 / productsPerRow}%`,
      maxWidth: `${100 / productsPerRow}%`,
    },
  })

  // Split products into pages
  const pages = []
  for (let i = 0; i < products.length; i += productsPerPage) {
    const pageProducts = products.slice(i, i + productsPerPage)
    pages.push(pageProducts)
  }

  return (
    <Document>
      {pages.map((pageProducts, pageIndex) => (
        <Page key={pageIndex} size="A4" orientation="landscape" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            {config.logoUrl && (
              <Image
                style={styles.logo}
                src={config.logoUrl}
              />
            )}
            {config.headerTitle && (
              <Text style={styles.title}>{config.headerTitle}</Text>
            )}
            {config.subheader && (
              <Text style={styles.subtitle}>{config.subheader}</Text>
            )}
            {config.season && (
              <Text style={styles.season}>{config.season}</Text>
            )}
          </View>

          {/* Products Grid */}
          <View style={styles.productsGrid}>
            {Array.from({ length: Math.ceil(pageProducts.length / productsPerRow) }, (_, rowIndex) => (
              <View key={rowIndex} style={styles.productRow}>
                {pageProducts.slice(rowIndex * productsPerRow, (rowIndex + 1) * productsPerRow).map((product) => (
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
            ))}
          </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={{ fontSize: 10, color: '#000000', position: 'absolute', bottom: 20, left: 20 }}>
            Page: {pageIndex + 1} of {pages.length}
          </Text>
          <Text style={{ fontSize: 10, color: '#000000', position: 'absolute', bottom: 20, left: 200 }}>
            {config.headerTitle}
          </Text>
          <Text style={{ fontSize: 10, color: '#000000', position: 'absolute', bottom: 20, right: 20 }}>
            POWERED BY NUORDER
          </Text>
        </View>
        </Page>
      ))}
    </Document>
  )
}