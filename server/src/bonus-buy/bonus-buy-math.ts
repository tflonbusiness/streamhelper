import { Decimal } from 'decimal.js';

function toMoneyString(value: Decimal): string {
  return value.toDecimalPlaces(2).toFixed(2);
}

export function computeMultiplier(
  winAmount: string,
  purchaseAmount: string,
): string {
  const purchase = new Decimal(purchaseAmount);
  if (purchase.lte(0)) {
    throw new Error('INVALID_PURCHASE_AMOUNT');
  }
  return toMoneyString(new Decimal(winAmount).div(purchase));
}

export function normalizeMoney(value: string): string {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    throw new Error('INVALID_AMOUNT');
  }
  const parsed = new Decimal(value);
  if (!parsed.isFinite() || parsed.lt(0)) {
    throw new Error('INVALID_AMOUNT');
  }
  return toMoneyString(parsed);
}

export function normalizeSignedMoney(value: string): string {
  if (!/^-?\d+(\.\d{1,2})?$/.test(value)) {
    throw new Error('INVALID_SIGNED_AMOUNT');
  }
  const parsed = new Decimal(value);
  if (!parsed.isFinite()) {
    throw new Error('INVALID_SIGNED_AMOUNT');
  }
  return toMoneyString(parsed);
}

export function normalizePositiveMoney(value: string): string {
  const normalized = normalizeMoney(value);
  if (new Decimal(normalized).lte(0)) {
    throw new Error('INVALID_AMOUNT');
  }
  return normalized;
}
