import type { SvgIconComponent } from '@mui/icons-material'
import Box from '@mui/material/Box'
import { alpha, useTheme, type Theme } from '@mui/material/styles'
import { colors } from '@/theme/colors'

export type TileIcon = SvgIconComponent

export type IconTileVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'muted'

type IconTileProps = {
  icon: TileIcon
  variant?: IconTileVariant
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: { box: 32, icon: 16 },
  md: { box: 40, icon: 20 },
  lg: { box: 48, icon: 24 },
} as const

function getVariantColors(variant: IconTileVariant, theme: Theme) {
  switch (variant) {
    case 'primary':
      return {
        bg: alpha(theme.palette.primary.main, 0.14),
        color: theme.palette.primary.light,
      }
    case 'secondary':
      return {
        bg: alpha(theme.palette.secondary.main, 0.14),
        color: theme.palette.secondary.main,
      }
    case 'success':
      return {
        bg: alpha(theme.palette.success.main, 0.14),
        color: theme.palette.success.light,
      }
    case 'warning':
      return {
        bg: alpha(theme.palette.warning.main, 0.14),
        color: theme.palette.warning.main,
      }
    case 'danger':
      return {
        bg: alpha(theme.palette.error.main, 0.14),
        color: theme.palette.error.main,
      }
    case 'info':
      return {
        bg: alpha(theme.palette.info.main, 0.14),
        color: theme.palette.info.light,
      }
    case 'purple':
      return {
        bg: alpha(colors.purple[500], 0.14),
        color: colors.purple[400],
      }
    case 'muted':
      return {
        bg: alpha(theme.palette.text.primary, 0.06),
        color: theme.palette.text.secondary,
      }
  }
}

export function IconTile({
  icon: Icon,
  variant = 'primary',
  size = 'md',
  className,
}: IconTileProps) {
  const theme = useTheme()
  const sizes = sizeMap[size]
  const variantColors = getVariantColors(variant, theme)

  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 1,
        width: sizes.box,
        height: sizes.box,
        bgcolor: variantColors.bg,
        color: variantColors.color,
      }}
    >
      <Icon sx={{ fontSize: sizes.icon }} aria-hidden />
    </Box>
  )
}
