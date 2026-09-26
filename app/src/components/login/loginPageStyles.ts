import { alpha, type SxProps, type Theme } from '@mui/material/styles'
import { colors } from '@/theme/colors'

export const loginCardOuterSx: SxProps<Theme> = {
  position: 'relative',
  borderRadius: 5,
  p: '1px',
  background: `linear-gradient(
    145deg,
    ${alpha(colors.purple[400], 0.7)} 0%,
    ${alpha(colors.purple[500], 0.15)} 35%,
    ${alpha(colors.neutral[100], 0.08)} 55%,
    ${alpha(colors.brand[500], 0.35)} 100%
  )`,
  boxShadow: `
    0 32px 80px ${alpha(colors.neutral[950], 0.85)},
    0 0 0 1px ${alpha(colors.purple[500], 0.08)},
    0 0 72px ${alpha(colors.purple[500], 0.18)}
  `,
}

export const loginCardInnerSx: SxProps<Theme> = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 4.875,
  bgcolor: alpha(colors.neutral[850], 0.72),
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}

export const loginCardGlowSx: SxProps<Theme> = {
  position: 'absolute',
  top: -100,
  left: '50%',
  width: 320,
  height: 200,
  transform: 'translateX(-50%)',
  background: `radial-gradient(ellipse at center, ${alpha(colors.purple[500], 0.4)} 0%, transparent 68%)`,
  pointerEvents: 'none',
}

export const loginCardShineSx: SxProps<Theme> = {
  position: 'absolute',
  top: 0,
  left: '12%',
  right: '12%',
  height: '1px',
  background: `linear-gradient(
    90deg,
    transparent,
    ${alpha(colors.purple[400], 0.55)},
    ${alpha(colors.neutral[100], 0.35)},
    transparent
  )`,
  pointerEvents: 'none',
}

export const loginCardContentSx: SxProps<Theme> = {
  position: 'relative',
  p: { xs: 3, sm: 4 },
}

export const loginTaglineSx: SxProps<Theme> = {
  background: `linear-gradient(90deg, ${colors.purple[400]} 0%, ${alpha(colors.neutral[100], 0.85)} 55%, ${colors.brand[400]} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 500,
}

export const loginDividerSx: SxProps<Theme> = {
  position: 'relative',
  py: 0.5,
  '&::before': {
    content: '""',
    display: 'block',
    height: '1px',
    background: `linear-gradient(
      90deg,
      transparent,
      ${alpha(colors.purple[500], 0.35)},
      transparent
    )`,
  },
}

export const loginFeatureItemSx: SxProps<Theme> = {
  flex: 1,
  minWidth: 0,
  alignItems: 'center',
  gap: 1,
  p: 1.5,
  borderRadius: 3,
  textAlign: 'center',
  bgcolor: alpha(colors.neutral[950], 0.35),
  border: `1px solid ${alpha(colors.purple[500], 0.14)}`,
  transition: 'border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease',
  '&:hover': {
    bgcolor: alpha(colors.purple[500], 0.08),
    borderColor: alpha(colors.purple[400], 0.28),
    transform: 'translateY(-2px)',
  },
}

export const loginLogoRingSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 88,
  height: 88,
  borderRadius: 3,
  background: `radial-gradient(circle at 30% 30%, ${alpha(colors.purple[400], 0.25)}, ${alpha(colors.neutral[900], 0.6)} 70%)`,
  border: `1px solid ${alpha(colors.purple[400], 0.3)}`,
  boxShadow: `
    0 0 32px ${alpha(colors.purple[500], 0.25)},
    inset 0 1px 0 ${alpha(colors.neutral[100], 0.08)}
  `,
}
