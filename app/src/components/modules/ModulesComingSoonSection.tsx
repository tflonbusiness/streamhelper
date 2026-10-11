import ChatIcon from '@mui/icons-material/Chat'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme, type Theme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { ComingSoonGameCard } from '@/components/modules/ComingSoonGameCard'
import { IconTile } from '@/components/IconTile'
import { COMING_SOON_WIDGET_CATALOG } from '@/lib/modules'
import { cardSx, colors, toneChipSx } from '@/theme/colors'

export function ModulesComingSoonSection() {
  const { t } = useTranslation()
  const theme = useTheme()
  const accent = colors.info[400]
  const gameCount = COMING_SOON_WIDGET_CATALOG.length

  return (
    <Box
      component="section"
      aria-labelledby="modules-coming-soon-title"
      sx={{
        ...cardSx,
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 2, sm: 2.5, md: 3 },
        borderColor: alpha(accent, 0.32),
        bgcolor: 'background.paper',
        boxShadow: `inset 4px 0 0 ${alpha(colors.info[500], 0.65)}`,
      }}
    >
      <Stack spacing={2.75} sx={{ position: 'relative' }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ minWidth: 0 }}>
          <IconTile icon={ChatIcon} variant="info" size="lg" />
          <Box sx={{ minWidth: 0, flex: 1, pt: 0.25 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                columnGap: 1,
                rowGap: 0.75,
              }}
            >
              <Typography
                id="modules-coming-soon-title"
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  m: 0,
                }}
              >
                {t('modules.comingSoonSectionTitle')}
              </Typography>
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  minHeight: 24,
                }}
              >
                <Chip
                  size="small"
                  label={t('modules.comingSoonBadge')}
                  sx={comingSoonChipSx(toneChipSx(accent))}
                />
                <Chip
                  size="small"
                  label={t('modules.comingSoonGameCount', { count: gameCount })}
                  sx={comingSoonChipSx(mutedCountChipSx(theme))}
                />
              </Box>
            </Box>
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: alpha(theme.palette.text.secondary, 0.9),
                lineHeight: 1.6,
                maxWidth: 580,
              }}
            >
              {t('modules.comingSoonSectionDescription')}
            </Typography>
          </Box>
        </Stack>

        <Box>
          <Typography
            variant="caption"
            component="p"
            sx={{
              mb: 1.25,
              fontWeight: 600,
              fontSize: '0.6875rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: alpha(theme.palette.text.secondary, 0.75),
            }}
          >
            {t('modules.comingSoonLineupTitle')}
          </Typography>
          <Grid container spacing={1.5}>
            {COMING_SOON_WIDGET_CATALOG.map((module, index) => (
              <Grid key={module.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ComingSoonGameCard
                  moduleId={module.id}
                  icon={module.icon}
                  iconVariant={module.iconVariant}
                  index={index}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Stack>
    </Box>
  )
}

function mutedCountChipSx(theme: Theme) {
  return {
    height: 24,
    fontSize: '0.75rem',
    fontWeight: 500,
    bgcolor: alpha(theme.palette.text.primary, 0.06),
    color: theme.palette.text.secondary,
    border: '1px solid',
    borderColor: alpha(theme.palette.text.primary, 0.1),
  }
}

function comingSoonChipSx(base: Record<string, unknown>) {
  return {
    ...base,
    height: 24,
    '& .MuiChip-label': {
      px: 1,
      lineHeight: 1,
    },
  }
}
