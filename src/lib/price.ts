export function formatPrice(price: string | number, currency: string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(numPrice)) return String(price)

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  })

  return formatter.format(numPrice)
}

export function parsePrice(price: string): number {
  // Remove currency symbols and parse
  const cleaned = price.replace(/[^\d.-]/g, '')
  return parseFloat(cleaned) || 0
}

export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
  }
  return symbols[currency] || currency
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates?: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amount
  
  // Simple exchange rate conversion
  // In production, you'd want to use a real exchange rate API
  const rates: Record<string, Record<string, number>> = {
    USD: { EUR: 0.85, GBP: 0.73, SEK: 8.5, NOK: 8.8, DKK: 6.8 },
    EUR: { USD: 1.18, GBP: 0.86, SEK: 10.0, NOK: 10.4, DKK: 8.0 },
    GBP: { USD: 1.37, EUR: 1.16, SEK: 11.6, NOK: 12.1, DKK: 9.3 },
    SEK: { USD: 0.12, EUR: 0.10, GBP: 0.086, NOK: 1.04, DKK: 0.80 },
    NOK: { USD: 0.11, EUR: 0.096, GBP: 0.083, SEK: 0.96, DKK: 0.77 },
    DKK: { USD: 0.15, EUR: 0.125, GBP: 0.11, SEK: 1.25, NOK: 1.30 },
  }

  const rate = exchangeRates?.[toCurrency] || rates[fromCurrency]?.[toCurrency] || 1
  return amount * rate
}
