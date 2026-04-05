/**
 * Format a number as Indian currency (Lakhs).
 * e.g. 1200000 → "₹12.0L"
 */
export function formatINR(amount: number): string {
  return `₹${(amount / 100000).toFixed(1)}L`
}

/**
 * Format a number as full Indian Rupee string.
 * e.g. 1200000 → "₹12,00,000"
 */
export function formatINRFull(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format a date string to a readable format.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

/**
 * Format time from a date string.
 */
export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  })
}
