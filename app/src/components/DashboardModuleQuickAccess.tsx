import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { alpha, useTheme, type Theme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import { DashboardSection } from '@/components/DashboardSection'
import { IconTile } from '@/components/IconTile'
import type { ModuleIconVariant } from '@/lib/modules'
import {
  getAvailableNavModules,
  moduleDescriptionKey,
  moduleNameKey,
} from '@/lib/modules'
import { MODULES_ROUTE } from '@/lib/routes'
import { cardSx, colors } from '@/theme/colors'

function accentColor(variant: ModuleIconVariant, theme: Theme): string {
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

export function DashboardModuleQuickAccess() {
  const { t } = useTranslation()
  const theme = useTheme()
  const modules = getAvailableNavModules()

  if (modules.length === 0) {
    return null
  }

  return (
    <DashboardSection
      title={t('dashboard.modulesQuickAccessTitle')}
      description={t('dashboard.modulesQuickAccessDescription')}
      action={
        <Button
          component={RouterLink}
          to={MODULES_ROUTE}
          size="small"
          variant="text"
          endIcon={<ArrowForwardIcon />}
          sx={{ flexShrink: 0 }}
        >
          {t('dashboard.viewAllModules')}
        </Button>
      }
    >
      <Grid container spacing={2}>
        {modules.map((module) => {
          const accent = accentColor(module.iconVariant, theme)

          return (
            <Grid key={module.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card
                elevation={0}
                sx={{
                  ...cardSx,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: theme.transitions.create(
                    ['border-color', 'transform', 'box-shadow'],
                    { duration: theme.transitions.duration.shorter },
                  ),
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(145deg, ${alpha(accent, 0.14)} 0%, transparent 55%)`,
                    pointerEvents: 'none',
                  },
                  '&:hover': {
                    borderColor: alpha(accent, 0.45),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.22)}`,
                  },
                }}
              >
                <CardActionArea
                  component={RouterLink}
                  to={module.widgetRoute!}
                  sx={{
                    height: '100%',
                    alignItems: 'stretch',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
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
                      <IconTile icon={module.icon} variant={module.iconVariant} size="lg" />
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
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                        {t(moduleNameKey(module.id))}
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
                        {t(moduleDescriptionKey(module.id))}
                      </Typography>
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: accent,
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {t('common.open')}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </DashboardSection>
  )
}
