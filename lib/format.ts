/**
 * Formats a number as currency in European format
 * Example: 1234.56 -> 1.234,56 €
 */
export function formatCurrency(value: number): string {
  // Ensure value is a number and handle edge cases
  const numValue = typeof value === 'number' ? value : parseFloat(value as any) || 0
  
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue)
}

/**
 * Formats a number as USD currency
 * Example: 1234.56 -> $1,234.56
 */
export function formatCurrencyUSD(value: number): string {
  // Ensure value is a number and handle edge cases
  const numValue = typeof value === 'number' ? value : parseFloat(value as any) || 0
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue)
}
