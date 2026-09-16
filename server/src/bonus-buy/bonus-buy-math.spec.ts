import { describe, expect, it } from 'vitest';
import {
  computeMultiplier,
  normalizeMoney,
  normalizePositiveMoney,
} from './bonus-buy-math.js';

describe('bonus-buy-math', () => {
  it('computes multiplier with 2 decimal places', () => {
    expect(computeMultiplier('60', '20')).toBe('3.00');
    expect(computeMultiplier('1', '3')).toBe('0.33');
  });

  it('normalizes money values', () => {
    expect(normalizeMoney('10')).toBe('10.00');
    expect(normalizeMoney('10.5')).toBe('10.50');
    expect(() => normalizeMoney('-1')).toThrow('INVALID_AMOUNT');
    expect(() => normalizeMoney('10.999')).toThrow('INVALID_AMOUNT');
  });

  it('requires positive purchase amounts', () => {
    expect(normalizePositiveMoney('0.01')).toBe('0.01');
    expect(() => normalizePositiveMoney('0')).toThrow('INVALID_AMOUNT');
    expect(() => computeMultiplier('10', '0')).toThrow('INVALID_PURCHASE_AMOUNT');
  });
});
