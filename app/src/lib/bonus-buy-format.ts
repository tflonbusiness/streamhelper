export function getBonusBuyCurrencySymbol(currencyCode?: string | null): string {
  const code = (currencyCode ?? 'USD').trim().toUpperCase() || 'USD'

  try {
    const narrow = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
    })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value

    if (narrow && narrow !== code) {
      return narrow
    }

    const symbol = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'symbol',
    })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value

    return symbol ?? code
  } catch {
    return code
  }
}

export function formatBonusBuyMoney(
  amount: string | number,
  currencyCode?: string | null,
): string {
  const value = typeof amount === 'string' ? Number.parseFloat(amount) : amount
  if (!Number.isFinite(value)) {
    return '—'
  }

  const code = (currencyCode ?? 'USD').trim().toUpperCase() || 'USD'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${getBonusBuyCurrencySymbol(code)}${value}`
  }
}

export function formatUsd(amount: string | number): string {
  return formatBonusBuyMoney(amount, 'USD')
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
