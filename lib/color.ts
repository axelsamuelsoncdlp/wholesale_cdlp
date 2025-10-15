export function extractColors(variants: Array<{ selectedOptions: Array<{ name: string; value: string }> }>): string | undefined {
  const colors = new Set<string>()
  
  variants.forEach(variant => {
    variant.selectedOptions.forEach(option => {
      if (option.name.toLowerCase() === 'color') {
        colors.add(option.value.toUpperCase())
      }
    })
  })

  if (colors.size === 0) {
    return undefined
  }

  return formatColors(Array.from(colors))
}

export function formatColors(colors: string[]): string {
  if (colors.length === 0) return ''
  if (colors.length === 1) return colors[0]

  // Sort colors for consistent output
  const sortedColors = colors.sort()
  
  // Join multiple colors with "+" as per reference format
  return sortedColors.join('+')
}

export function normalizeColorName(color: string): string {
  // Common color name normalizations
  const colorMap: Record<string, string> = {
    'NAVY': 'DARK NAVY',
    'ROYAL BLUE': 'AZURE BLUE',
    'LIGHT BLUE': 'AZURE BLUE',
    'BLACK': 'BLACK',
    'WHITE': 'WHITE',
    'GRAY': 'GRAY',
    'GREY': 'GRAY',
    'RED': 'RED',
    'GREEN': 'GREEN',
    'BLUE': 'BLUE',
    'YELLOW': 'YELLOW',
    'ORANGE': 'ORANGE',
    'PURPLE': 'PURPLE',
    'PINK': 'PINK',
    'BROWN': 'BROWN',
    'BEIGE': 'BEIGE',
    'KHAKI': 'KHAKI',
    'OLIVE': 'OLIVE',
    'MAROON': 'MAROON',
    'BURGUNDY': 'BURGUNDY',
  }

  const upperColor = color.toUpperCase()
  return colorMap[upperColor] || upperColor
}

export function getColorFromMetafield(metafields: Array<{ key: string; value: string }>): string | undefined {
  const colorMetafield = metafields.find(m => 
    m.key.toLowerCase().includes('color') || 
    m.key.toLowerCase().includes('colour')
  )
  
  if (!colorMetafield?.value) return undefined
  
  // Handle multiple colors in metafield (comma-separated, etc.)
  const colors = colorMetafield.value
    .split(/[,;|]/)
    .map(c => normalizeColorName(c.trim()))
    .filter(c => c.length > 0)
  
  return formatColors(colors)
}
