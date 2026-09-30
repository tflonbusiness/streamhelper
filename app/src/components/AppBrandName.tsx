import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { TypographyProps } from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { brandTitleSx } from '@/theme/brandTypography'
import { colors } from '@/theme/colors'

type AppBrandNameProps = {
  size?: 'sidebar' | 'md' | 'lg'
  component?: TypographyProps['component']
  noWrap?: boolean
}

const sizeSx = {
  sidebar: { fontSize: '0.9375rem' },
  md: {},
  lg: { fontSize: '2.125rem' },
} as const

export function AppBrandName({
  size = 'md',
  component = 'span',
  noWrap = true,
}: AppBrandNameProps) {
  const { t } = useTranslation()

  return (
    <Typography
      component={component}
      variant={size === 'lg' ? 'h4' : 'subtitle2'}
      sx={{
        ...brandTitleSx,
        ...sizeSx[size],
        ...(noWrap
          ? {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }
          : {}),
      }}
    >
      {t('common.appNameStream')}
      <Box
        component="span"
        sx={{
          color: colors.brand[500],
        }}
      >
        {t('common.appNameHelper')}
      </Box>
    </Typography>
  )
}

export function appBrandNamePlain(t: (key: string) => string): string {
  return `${t('common.appNameStream')}${t('common.appNameHelper')}`
}
