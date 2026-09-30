import Box from '@mui/material/Box'
import { alpha, type SxProps, type Theme } from '@mui/material/styles'
import { colors } from '@/theme/colors'

const LOGO_GLOW_FILTER = [
  `drop-shadow(0 0 8px ${alpha(colors.brand[500], 0.95)})`,
  `drop-shadow(0 0 18px ${alpha(colors.brand[400], 0.6)})`,
  `drop-shadow(0 0 28px ${alpha(colors.brand[500], 0.35)})`,
].join(' ')

export const appLogoImageTransitionSx = {
  transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.22s ease',
} as const

export const appLogoImageHoverSx = {
  transform: 'scale(1.1)',
  filter: LOGO_GLOW_FILTER,
} as const

const sizeMap = {
  sidebarCompact: 28,
  sidebar: 32,
  md: 48,
  lg: 64,
} as const

export type AppLogoSize = keyof typeof sizeMap

export function appLogoSx(sizePx: number): SxProps<Theme> {
  return {
    width: sizePx,
    height: sizePx,
    flexShrink: 0,
    display: 'block',
    ...appLogoImageTransitionSx,
    '&:hover': appLogoImageHoverSx,
  }
}

type AppLogoProps = {
  alt: string
  size?: AppLogoSize | number
  className?: string
}

export function AppLogo({ alt, size = 'md', className }: AppLogoProps) {
  const sizePx = typeof size === 'number' ? size : sizeMap[size]

  return (
    <Box
      component="img"
      src="/logo.svg"
      alt={alt}
      className={className}
      sx={appLogoSx(sizePx)}
    />
  )
}
