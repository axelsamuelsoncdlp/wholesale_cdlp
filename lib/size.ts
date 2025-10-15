export function aggregateSizes(variants: Array<{ selectedOptions: Array<{ name: string; value: string }> }>): string | undefined {
  const sizes = new Set<string>()
  
  variants.forEach(variant => {
    variant.selectedOptions.forEach(option => {
      if (option.name.toLowerCase() === 'size') {
        sizes.add(option.value.toUpperCase())
      }
    })
  })

  if (sizes.size === 0) {
    return undefined
  }

  const sizeArray = Array.from(sizes)
  return formatSizeRange(sizeArray)
}

export function formatSizeRange(sizes: string[]): string {
  if (sizes.length === 0) return ''
  if (sizes.length === 1) return sizes[0]

  // Standard size order for clothing
  const sizeOrder = [
    'XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL',
    '28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50', '52'
  ]

  const sortedSizes = sizes.sort((a, b) => {
    const aIndex = sizeOrder.indexOf(a)
    const bIndex = sizeOrder.indexOf(b)
    
    // If both are in the standard order, sort by index
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    
    // If only one is in standard order, put it first
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    
    // If neither is in standard order, sort alphabetically
    return a.localeCompare(b)
  })

  // Check if we can create a range
  if (sortedSizes.length > 1) {
    const first = sortedSizes[0]
    const last = sortedSizes[sortedSizes.length - 1]
    
    // Check if it's a reasonable range
    const firstIndex = sizeOrder.indexOf(first)
    const lastIndex = sizeOrder.indexOf(last)
    
    // If both sizes are in the standard order and the gap is reasonable
    if (firstIndex !== -1 && lastIndex !== -1 && (lastIndex - firstIndex) <= 8) {
      // Check if we have most sizes in between
      const expectedSizeCount = lastIndex - firstIndex + 1
      if (sortedSizes.length >= expectedSizeCount * 0.8) { // At least 80% of the range
        return `${last} - ${first}`
      }
    }
  }

  return sortedSizes.join(', ')
}

export function isSequentialSizes(sizes: string[]): boolean {
  const sizeOrder = [
    'XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'
  ]
  
  const sortedSizes = sizes.sort((a, b) => {
    const aIndex = sizeOrder.indexOf(a)
    const bIndex = sizeOrder.indexOf(b)
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  for (let i = 0; i < sortedSizes.length - 1; i++) {
    const currentIndex = sizeOrder.indexOf(sortedSizes[i])
    const nextIndex = sizeOrder.indexOf(sortedSizes[i + 1])
    
    if (currentIndex !== -1 && nextIndex !== -1) {
      if (nextIndex - currentIndex !== 1) {
        return false
      }
    }
  }
  
  return true
}
