export const PRIZE_SPIN_WIDGET_THEME = {
  cardBg: '#0A0A0CE6',
  cardBorder: '#2F2F31',
  cardRadius: 20,
  cardShadow: '0 8px 32px rgba(0,0,0,0.45)',
  surface: '#121215',
  moduleAccent: '#A78BFA',
  moduleAccentGlow: 'rgba(167,139,250,0.35)',
  pointerFill: '#F59E0B',
  pointerStroke: '#D97706',
  textPrimary: '#FFFFFF',
  textMuted: '#9CA3AF',
  divider: 'rgba(255,255,255,0.12)',
  fontFamily: 'Inter, system-ui, sans-serif',
  baseSize: 800,
} as const

export type PrizeSpinWidgetTheme = typeof PRIZE_SPIN_WIDGET_THEME & {
  scale: number
}

export function scaleForSize(width: number, height: number): number {
  return Math.min(width, height) / PRIZE_SPIN_WIDGET_THEME.baseSize
}

export function buildPrizeSpinWidgetTheme(
  width: number,
  height: number,
): PrizeSpinWidgetTheme {
  return {
    ...PRIZE_SPIN_WIDGET_THEME,
    scale: scaleForSize(width, height),
  }
}

export function scaledPx(value: number, scale: number): number {
  return Math.round(value * scale)
}
