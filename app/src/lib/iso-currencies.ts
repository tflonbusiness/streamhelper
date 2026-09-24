import { getBonusBuyCurrencySymbol } from '@/lib/bonus-buy-format'

export type IsoCurrency = {
  code: string
  name: string
  symbol: string
}

const displayNames = new Intl.DisplayNames(['en'], { type: 'currency' })

export const ISO_CURRENCIES: IsoCurrency[] = Intl.supportedValuesOf('currency')
  .map((code) => ({
    code,
    name: displayNames.of(code) ?? code,
    symbol: getBonusBuyCurrencySymbol(code),
  }))
  .sort((a, b) => a.code.localeCompare(b.code))

const CODE_SET = new Set(ISO_CURRENCIES.map((entry) => entry.code))

const SEARCH_ALIASES: Record<string, string[]> = {
  USD: ['dollar', 'dollars', 'us dollar', 'united states'],
  EUR: ['euro', 'euros'],
  GBP: ['pound', 'pounds', 'sterling', 'british'],
  JPY: ['yen', 'japan'],
  CHF: ['franc', 'swiss'],
  CAD: ['canadian dollar'],
  AUD: ['australian dollar'],
  CNY: ['yuan', 'rmb', 'china'],
  RUB: ['ruble', 'rouble', 'russia'],
  UAH: ['hryvnia', 'ukraine'],
  PLN: ['zloty', 'poland'],
}

export function isValidIsoCurrencyCode(code: string): boolean {
  return CODE_SET.has(code.trim().toUpperCase())
}

export function filterIsoCurrencies(
  options: IsoCurrency[],
  query: string,
): IsoCurrency[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return options
  }

  return options.filter((entry) => {
    if (entry.code.toLowerCase().includes(normalized)) {
      return true
    }
    if (entry.symbol.toLowerCase().includes(normalized)) {
      return true
    }
    if (entry.name.toLowerCase().includes(normalized)) {
      return true
    }
    const aliases = SEARCH_ALIASES[entry.code]
    return aliases?.some((alias) => alias.includes(normalized)) ?? false
  })
}
