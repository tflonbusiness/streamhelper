import type { SvgIconComponent } from '@mui/icons-material'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { alpha, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import { IconTile } from '@/components/IconTile'
import { moduleAccentColor } from '@/lib/module-accent-color'
import type { ModuleIconVariant } from '@/lib/modules'
import { moduleDescriptionKey, moduleNameKey } from '@/lib/modules'
import { cardSx } from '@/theme/colors'

type ModuleCatalogCardProps = {
  moduleId: string
  icon: SvgIconComponent
  iconVariant: ModuleIconVariant
  widgetRoute?: string
  available?: boolean
}

export function ModuleCatalogCard({
  moduleId,
  icon,
  iconVariant,
  widgetRoute,
  available = true,
}: ModuleCatalogCardProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const accent = moduleAccentColor(iconVariant, theme)
  const canOpen = available && Boolean(widgetRoute)

  const cardShellSx = {
    ...cardSx,
    height: '100%',
    position: 'relative' as const,
    overflow: 'hidden',
    ...(!canOpen ? { opacity: 0.72 } : {}),
    transition: theme.transitions.create(
      ['border-color', 'transform', 'box-shadow', 'opacity'],
      { duration: theme.transitions.duration.shorter },
    ),
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: `linear-gradient(145deg, ${alpha(accent, canOpen ? 0.14 : 0.08)} 0%, transparent 55%)`,
      pointerEvents: 'none',
    },
    ...(canOpen
      ? {
          '&:hover': {
            borderColor: alpha(accent, 0.45),
            transform: 'translateY(-2px)',
            boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.22)}`,
          },
        }
      : {}),
  }

  const content = (
    <CardContent
      sx={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2.5,
        '&:last-child': { pb: 2.5 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <IconTile icon={icon} variant={iconVariant} size="lg" />
        {canOpen ? (
          <ArrowForwardIcon
            sx={{
              fontSize: 20,
              mt: 0.5,
              color: alpha(theme.palette.text.primary, 0.28),
              transition: 'transform 0.2s ease, color 0.2s ease',
              '.MuiCardActionArea-root:hover &': {
                transform: 'translateX(2px)',
                color: accent,
              },
            }}
            aria-hidden
          />
        ) : null}
      </Box>

      <Box
        sx={{
          minWidth: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}
        >
          {t(moduleNameKey(moduleId))}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {t(moduleDescriptionKey(moduleId))}
        </Typography>
      </Box>

      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: canOpen ? accent : alpha(theme.palette.text.primary, 0.45),
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}
      >
        {canOpen ? t('common.open') : t('common.comingSoon')}
      </Typography>
    </CardContent>
  )

  return (
    <Card elevation={0} sx={cardShellSx}>
      {canOpen ? (
        <CardActionArea
          component={RouterLink}
          to={widgetRoute!}
          sx={{
            height: '100%',
            alignItems: 'stretch',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {content}
        </CardActionArea>
      ) : (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {content}
        </Box>
      )}
    </Card>
  )
}
