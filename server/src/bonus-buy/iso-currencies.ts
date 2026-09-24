const ISO_CURRENCY_CODES = new Set(Intl.supportedValuesOf('currency'));

export function normalizeCurrencyCode(code: string): string {
  const upper = code.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(upper) || !ISO_CURRENCY_CODES.has(upper)) {
    throw new Error('INVALID_CURRENCY_CODE');
  }
  return upper;
}

export function isValidCurrencyCode(code: string): boolean {
  try {
    normalizeCurrencyCode(code);
    return true;
  } catch {
    return false;
  }
}
