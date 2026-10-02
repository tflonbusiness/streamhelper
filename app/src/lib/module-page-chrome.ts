import { alpha, type SxProps, type Theme } from '@mui/material/styles'
import {
  moduleAccentColor,
  moduleAccentGradient,
} from '@/lib/module-accent-color'
import type { ModuleIconVariant } from '@/lib/modules'

export function modulePageHeaderSx(
  iconVariant: ModuleIconVariant,
  theme: Theme,
): SxProps<Theme> {
  const accent = moduleAccentColor(iconVariant, theme)

  return {
    borderColor: alpha(accent, 0.34),
    boxShadow: `inset 4px 0 0 ${accent}`,
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '42%',
      height: '100%',
      background: `radial-gradient(circle at 100% 0%, ${alpha(accent, 0.12)} 0%, transparent 58%)`,
      pointerEvents: 'none',
    },
  }
}

export function moduleHeaderGradientOpacity(moduleSurface: boolean): number {
  return moduleSurface ? 0.22 : 0.14
}

export function moduleHeaderBackground(
  iconVariant: ModuleIconVariant,
  theme: Theme,
  moduleSurface: boolean,
  hasIcon: boolean,
): string {
  if (!hasIcon) {
    return `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 42%)`
  }
  return moduleAccentGradient(
    iconVariant,
    theme,
    moduleHeaderGradientOpacity(moduleSurface),
  )
}

/** Live-session hero card chrome aligned with module accent. */
export function moduleLiveHeroCardSx(
  iconVariant: ModuleIconVariant,
  theme: Theme,
  empty?: boolean,
): SxProps<Theme> {
  const accent = moduleAccentColor(iconVariant, theme)

  if (empty) {
    return {
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid',
      borderColor: theme.palette.divider,
      borderRadius: theme.shape.borderRadius,
      backgroundColor: alpha(theme.palette.text.primary, 0.02),
    }
  }

  return {
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: alpha(accent, 0.38),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(accent, 0.06),
    boxShadow: `inset 4px 0 0 ${accent}`,
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: `linear-gradient(125deg, ${alpha(accent, 0.1)} 0%, transparent 52%)`,
      pointerEvents: 'none',
    },
  }
}
