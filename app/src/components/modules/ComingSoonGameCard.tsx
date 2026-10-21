import type { SvgIconComponent } from '@mui/icons-material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { IconTile } from '@/components/IconTile'
import { moduleAccentColor } from '@/lib/module-accent-color'
import type { ModuleIconVariant } from '@/lib/modules'
import { moduleDescriptionKey, moduleNameKey } from '@/lib/modules'
import { cardSx } from '@/theme/colors'

type ComingSoonGameCardProps = {
  moduleId: string
  icon: SvgIconComponent
  iconVariant: ModuleIconVariant
  index: number
}

export function ComingSoonGameCard({
  moduleId,
  icon,
  iconVariant,
  index,
}: ComingSoonGameCardProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const accent = moduleAccentColor(iconVariant, theme)

  return (
    <Box
      sx={{
        ...cardSx,
        height: '100%',
        p: 1.75,
        display: 'flex',
        gap: 1.5,
        alignItems: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: alpha(theme.palette.background.paper, 0.65),
        borderColor: alpha(accent, 0.32),
        boxShadow: `inset 3px 0 0 ${accent}, 0 10px 28px ${alpha(theme.palette.common.black, 0.18)}`,
        transform: 'translateY(-1px)',
        animation: 'comingSoonCardIn 0.45s ease backwards',
        animationDelay: `${Math.min(index, 8) * 45}ms`,
        '@keyframes comingSoonCardIn': {
          from: {
            opacity: 0,
            transform: 'translateY(8px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(-1px)',
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(125deg, ${alpha(accent, 0.09)} 0%, transparent 48%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <IconTile icon={icon} variant={iconVariant} size="md" />
      <Box sx={{ minWidth: 0, flex: 1, position: 'relative' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.35 }}
          >
            {t(moduleNameKey(moduleId))}
          </Typography>
          <Typography
            component="span"
            variant="caption"
            aria-hidden
            sx={{
              flexShrink: 0,
              fontWeight: 600,
              fontSize: '0.65rem',
              color: alpha(theme.palette.text.primary, 0.22),
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </Typography>
        </Box>
        <Typography
          variant="caption"
          component="p"
          sx={{
            mt: 0.5,
            color: alpha(theme.palette.text.secondary, 0.85),
            lineHeight: 1.45,
          }}
        >
          {t(moduleDescriptionKey(moduleId))}
        </Typography>
      </Box>
    </Box>
  )
}
