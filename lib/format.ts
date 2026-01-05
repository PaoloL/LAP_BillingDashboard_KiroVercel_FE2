/**
 * Formats a number as currency in European format
 * Example: 1234.56 -> 1.234,56 €
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
