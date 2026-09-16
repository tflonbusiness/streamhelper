import { Decimal } from 'decimal.js';

export function computeMultiplier(
  winAmount: string,
  purchaseAmount: string,
): string {
  const purchase = new Decimal(purchaseAmount);
  if (purchase.lte(0)) {
    throw new Error('INVALID_PURCHASE_AMOUNT');
  }
  return new Decimal(winAmount).div(purchase).toDecimalPlaces(2).toString();
}

export function normalizeMoney(value: string): string {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    throw new Error('INVALID_AMOUNT');
  }
  const parsed = new Decimal(value);
  if (!parsed.isFinite() || parsed.lt(0)) {
    throw new Error('INVALID_AMOUNT');
  }
  return parsed.toDecimalPlaces(2).toString();
}

export function normalizePositiveMoney(value: string): string {
  const normalized = normalizeMoney(value);
  if (new Decimal(normalized).lte(0)) {
    throw new Error('INVALID_AMOUNT');
  }
  return normalized;
}
