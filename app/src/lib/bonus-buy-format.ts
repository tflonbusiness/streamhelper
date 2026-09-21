export function formatUsd(amount: string | number): string {
  const value = typeof amount === 'string' ? Number.parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export function sanitizeDecimalInput(value: string): string {
  const digitsAndDots = value.replace(/[^\d.]/g, '')
  const firstDotIndex = digitsAndDots.indexOf('.')

  if (firstDotIndex === -1) {
    return digitsAndDots
  }

  const integerPart = digitsAndDots.slice(0, firstDotIndex)
  const fractionalPart = digitsAndDots.slice(firstDotIndex + 1).replace(/\./g, '')

  return `${integerPart}.${fractionalPart}`
}

export const decimalMoneyInputSlotProps = {
  htmlInput: {
    inputMode: 'decimal' as const,
  },
}
