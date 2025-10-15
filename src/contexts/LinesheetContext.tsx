'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ShopifyProduct } from '@/lib/shopify'

export interface LinesheetConfig {
  headerTitle: string
  subheader: string
  currency: string
  priceSource: 'price_list' | 'metafield' | 'variant_price'
  season: string
  productsPerRow: number
  logoUrl?: string
  fieldToggles: {
    productName: boolean
    styleNumber: boolean
    season: boolean
    wholesalePrice: boolean
    msrpPrice: boolean
    sizes: boolean
    colors: boolean
    images: boolean
  }
}

export interface LinesheetContextType {
  selectedProducts: ShopifyProduct[]
  setSelectedProducts: (products: ShopifyProduct[]) => void
  addSelectedProduct: (product: ShopifyProduct) => void
  removeSelectedProduct: (productId: string) => void
  clearSelectedProducts: () => void
  config: LinesheetConfig
  setConfig: (config: LinesheetConfig) => void
  updateConfig: (updates: Partial<LinesheetConfig>) => void
  isProductSelected: (productId: string) => boolean
}

const defaultConfig: LinesheetConfig = {
  headerTitle: '',
  subheader: '',
  currency: 'USD',
  priceSource: 'price_list',
  season: '',
  productsPerRow: 8,
  logoUrl: undefined,
  fieldToggles: {
    productName: true,
    styleNumber: true,
    season: true,
    wholesalePrice: true,
    msrpPrice: true,
    sizes: true,
    colors: true,
    images: true,
  },
}

const LinesheetContext = createContext<LinesheetContextType | undefined>(undefined)

export function LinesheetProvider({ children }: { children: ReactNode }) {
  const [selectedProducts, setSelectedProducts] = useState<ShopifyProduct[]>([])
  const [config, setConfig] = useState<LinesheetConfig>(defaultConfig)

  // Load logo from database on mount
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch('/api/logo?shop=cdlpstore')
        if (response.ok) {
          const data = await response.json()
          if (data.logoUrl) {
            setConfig(prev => ({ ...prev, logoUrl: data.logoUrl }))
          }
        }
      } catch (error) {
        console.error('Error loading logo:', error)
      }
    }
    
    loadLogo()
  }, [])

  const addSelectedProduct = (product: ShopifyProduct) => {
    setSelectedProducts(prev => {
      if (prev.find(p => p.id === product.id)) {
        return prev // Already selected
      }
      return [...prev, product]
    })
  }

  const removeSelectedProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId))
  }

  const clearSelectedProducts = () => {
    setSelectedProducts([])
  }

  const updateConfig = (updates: Partial<LinesheetConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const isProductSelected = (productId: string) => {
    return selectedProducts.some(p => p.id === productId)
  }

  const value: LinesheetContextType = {
    selectedProducts,
    setSelectedProducts,
    addSelectedProduct,
    removeSelectedProduct,
    clearSelectedProducts,
    config,
    setConfig,
    updateConfig,
    isProductSelected,
  }

  return (
    <LinesheetContext.Provider value={value}>
      {children}
    </LinesheetContext.Provider>
  )
}

export function useLinesheet() {
  const context = useContext(LinesheetContext)
  if (context === undefined) {
    throw new Error('useLinesheet must be used within a LinesheetProvider')
  }
  return context
}
