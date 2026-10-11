import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import { useTranslation } from 'react-i18next'
import { ModuleCatalogCard } from '@/components/ModuleCatalogCard'
import { ModulesComingSoonSection } from '@/components/modules/ModulesComingSoonSection'
import { PageHeader } from '@/components/PageHeader'
import { MODULE_PAGE_SECTION_SPACING } from '@/lib/module-page-layout'
import { MODULE_CATALOG } from '@/lib/modules'

export function ModulesPage() {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Stack
      spacing={MODULE_PAGE_SECTION_SPACING}
      sx={{ bgcolor: 'background.default' }}
    >
      <PageHeader
        title={t('modules.pageTitle')}
        description={t('modules.pageDescription')}
        icon={SportsEsportsIcon}
        iconVariant="primary"
        flatBackground
      />
      <Box>
        <Typography
          variant="caption"
          component="p"
          sx={{
            mb: 1.5,
            fontWeight: 600,
            fontSize: '0.6875rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: alpha(theme.palette.text.secondary, 0.72),
          }}
        >
          {t('modules.availableSectionTitle')}
        </Typography>
        <Grid container spacing={2}>
        {MODULE_CATALOG.map((module) => (
          <Grid key={module.id} size={{ xs: 12, sm: 6 }}>
            <ModuleCatalogCard
              moduleId={module.id}
              icon={module.icon}
              iconVariant={module.iconVariant}
              widgetRoute={module.widgetRoute}
            />
          </Grid>
        ))}
        </Grid>
      </Box>

      <ModulesComingSoonSection />
    </Stack>
  )
}
