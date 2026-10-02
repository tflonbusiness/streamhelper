import { alpha, type Theme } from '@mui/material/styles'
import type { ModuleIconVariant } from '@/lib/modules'
import { MODULE_CATALOG } from '@/lib/modules'
import { colors } from '@/theme/colors'

export function moduleAccentColor(
  variant: ModuleIconVariant,
  theme: Theme,
): string {
  switch (variant) {
    case 'primary':
      return theme.palette.primary.main
    case 'success':
      return theme.palette.success.main
    case 'warning':
      return theme.palette.warning.main
    case 'danger':
      return theme.palette.error.main
    case 'info':
      return theme.palette.info.main
    case 'purple':
      return colors.purple[500]
    case 'muted':
      return theme.palette.text.secondary
  }
}

export function moduleAccentGradient(
  variant: ModuleIconVariant,
  theme: Theme,
  opacity = 0.14,
): string {
  const accent = moduleAccentColor(variant, theme)
  return `linear-gradient(145deg, ${alpha(accent, opacity)} 0%, transparent 55%)`
}

export function moduleAccentForModuleId(moduleId: string, theme: Theme): string {
  const variant =
    MODULE_CATALOG.find((module) => module.id === moduleId)?.iconVariant ??
    'primary'
  return moduleAccentColor(variant, theme)
}
