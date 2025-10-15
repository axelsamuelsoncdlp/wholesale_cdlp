import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer'
import { LinesheetItem, LinesheetConfig } from '../types'

// Register Inter font for PDF
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
      fontWeight: 300,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
      fontWeight: 600,
    },
  ],
})

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 30,
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    textAlign: 'center',
    marginBottom: 8,
    color: '#111827',
  },
  subheader: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 8,
  },
  season: {
    fontSize: 12,
    textAlign: 'center',
    color: '#6B7280',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    gap: 20,
  },
  column: {
    flex: 1,
    gap: 15,
  },
  productCard: {
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: 12,
    marginBottom: 12,
  },
  productName: {
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 4,
    color: '#111827',
    textTransform: 'uppercase',
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  fieldLabel: {
    width: 60,
    fontSize: 9,
    color: '#6B7280',
    marginRight: 8,
  },
  fieldValue: {
    flex: 1,
    fontSize: 9,
    color: '#111827',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 9,
    color: '#6B7280',
  },
})

interface LinesheetDocumentProps {
  items: LinesheetItem[]
  config: LinesheetConfig
}

const ProductCard: React.FC<{ item: LinesheetItem; config: LinesheetConfig }> = ({ item, config }) => {
  const { fieldToggles } = config

  return (
    <View style={styles.productCard}>
      <Text style={styles.productName}>{item.title}</Text>
      
      {fieldToggles.styleNumber && item.styleNumber && (
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Style #:</Text>
          <Text style={styles.fieldValue}>{item.styleNumber}</Text>
        </View>
      )}
      
      {fieldToggles.season && item.season && (
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Season:</Text>
          <Text style={styles.fieldValue}>{item.season}</Text>
        </View>
      )}
      
      {fieldToggles.wholesale && item.wholesale && (
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Wholesale:</Text>
          <Text style={styles.fieldValue}>{item.wholesale}</Text>
        </View>
      )}
      
      {fieldToggles.msrp && item.msrp && (
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>M.S.R.P.:</Text>
          <Text style={styles.fieldValue}>{item.msrp}</Text>
        </View>
      )}
      
      {fieldToggles.sizes && item.sizes && (
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Sizes:</Text>
          <Text style={styles.fieldValue}>{item.sizes}</Text>
        </View>
      )}
      
      {fieldToggles.color && item.color && (
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Color:</Text>
          <Text style={styles.fieldValue}>{item.color}</Text>
        </View>
      )}
    </View>
  )
}

export const LinesheetDocument: React.FC<LinesheetDocumentProps> = ({ items, config }) => {
  // Split items into two columns
  const leftColumnItems = items.filter((_, index) => index % 2 === 0)
  const rightColumnItems = items.filter((_, index) => index % 2 === 1)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{config.headerTitle}</Text>
          {config.subheader && (
            <Text style={styles.subheader}>{config.subheader}</Text>
          )}
          {config.season && (
            <Text style={styles.season}>{config.season}</Text>
          )}
        </View>

        {/* Content - Two Columns */}
        <View style={styles.content}>
          {/* Left Column */}
          <View style={styles.column}>
            {leftColumnItems.map((item, index) => (
              <ProductCard key={`left-${index}`} item={item} config={config} />
            ))}
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            {rightColumnItems.map((item, index) => (
              <ProductCard key={`right-${index}`} item={item} config={config} />
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Page ${pageNumber}`} />
      </Page>
    </Document>
  )
}
