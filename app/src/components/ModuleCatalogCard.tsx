import type { SvgIconComponent } from '@mui/icons-material'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import IconButton from '@mui/material/IconButton'
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
  /** Uses horizontal icon + copy on wider cards (modules catalog). */
  layout?: 'stacked' | 'horizontal'
  isFavorite?: boolean
  favoriteTogglePending?: boolean
  onFavoriteToggle?: () => void
}

export function ModuleCatalogCard({
  moduleId,
  icon,
  iconVariant,
  widgetRoute,
  available = true,
  layout = 'stacked',
  isFavorite = false,
  favoriteTogglePending = false,
  onFavoriteToggle,
}: ModuleCatalogCardProps) {
  const horizontal = layout === 'horizontal'
  const { t } = useTranslation()
  const theme = useTheme()
  const accent = moduleAccentColor(iconVariant, theme)
  const canOpen = available && Boolean(widgetRoute)
  const showFavorite = canOpen && onFavoriteToggle !== undefined

  const cardShellSx = {
    ...cardSx,
    width: '100%',
    height: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
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
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: horizontal ? 'row' : 'column',
        alignItems: horizontal ? 'flex-start' : 'stretch',
        gap: 2,
        p: horizontal ? 2.25 : 2.5,
        '&:last-child': { pb: horizontal ? 2.25 : 2.5 },
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <IconTile
          icon={icon}
          variant={iconVariant}
          size={horizontal ? 'md' : 'lg'}
        />
      </Box>

      <Box
        sx={{
          minWidth: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: horizontal ? 1 : 0.75,
          alignSelf: 'stretch',
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
          <Typography
            variant={horizontal ? 'subtitle1' : 'subtitle1'}
            sx={{ fontWeight: 600, letterSpacing: '-0.01em', m: 0 }}
          >
            {t(moduleNameKey(moduleId))}
          </Typography>
          {canOpen ? (
            <ArrowForwardIcon
              sx={{
                fontSize: 20,
                mt: 0.15,
                flexShrink: 0,
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

        <Typography
          variant="body2"
          sx={{
            color: alpha(theme.palette.text.secondary, 0.72),
            lineHeight: 1.55,
            flex: horizontal ? 1 : undefined,
          }}
        >
          {t(moduleDescriptionKey(moduleId))}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: canOpen ? accent : alpha(theme.palette.text.primary, 0.45),
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            mt: 'auto',
            pt: 1,
          }}
        >
          {canOpen ? t('common.open') : t('common.comingSoon')}
        </Typography>
      </Box>
    </CardContent>
  )

  return (
    <Card elevation={0} sx={cardShellSx}>
      {showFavorite ? (
        <IconButton
          size="small"
          disabled={favoriteTogglePending}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onFavoriteToggle?.()
          }}
          aria-label={
            isFavorite
              ? t('modules.favorite.removeAria', {
                  name: t(moduleNameKey(moduleId)),
                })
              : t('modules.favorite.addAria', {
                  name: t(moduleNameKey(moduleId)),
                })
          }
          aria-pressed={isFavorite}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            color: isFavorite ? accent : alpha(theme.palette.text.primary, 0.35),
            '&:hover': {
              color: accent,
              backgroundColor: alpha(accent, 0.12),
            },
          }}
        >
          {isFavorite ? (
            <StarIcon fontSize="small" />
          ) : (
            <StarBorderIcon fontSize="small" />
          )}
        </IconButton>
      ) : null}
      {canOpen ? (
        <CardActionArea
          component={RouterLink}
          to={widgetRoute!}
          sx={{
            flex: 1,
            width: '100%',
            alignItems: 'stretch',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {content}
        </CardActionArea>
      ) : (
        <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
          {content}
        </Box>
      )}
    </Card>
  )
}
