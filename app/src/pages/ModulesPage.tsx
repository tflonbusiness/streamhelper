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
import { DEFAULT_FAVORITE_MODULE_IDS, MODULE_CATALOG } from '@/lib/modules'
import {
  useModuleFavorites,
  useToggleModuleFavorite,
} from '@/queries/use-module-favorites'

function ModulesSectionLabel({
  children,
  id,
}: {
  children: string
  id?: string
}) {
  const theme = useTheme()
  return (
    <Typography
      id={id}
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
      {children}
    </Typography>
  )
}

export function ModulesPage() {
  const { t } = useTranslation()
  const { data: favorites, isPending } = useModuleFavorites()
  const toggleFavorite = useToggleModuleFavorite()
  const favoriteIds =
    favorites?.moduleIds ??
    (isPending ? [...DEFAULT_FAVORITE_MODULE_IDS] : [])

  return (
    <Stack
      spacing={MODULE_PAGE_SECTION_SPACING}
      sx={{ bgcolor: 'background.default', width: '100%' }}
    >
      <PageHeader
        title={t('modules.pageTitle')}
        description={t('modules.pageDescription')}
        icon={SportsEsportsIcon}
        iconVariant="primary"
        moduleSurface
      />

      <Box component="section" aria-labelledby="modules-available-heading">
        <ModulesSectionLabel id="modules-available-heading">
          {t('modules.availableSectionTitle')}
        </ModulesSectionLabel>
        <Grid container spacing={2} alignItems="stretch">
          {MODULE_CATALOG.map((module) => (
            <Grid
              key={module.id}
              size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}
              sx={{ display: 'flex' }}
            >
              <ModuleCatalogCard
                moduleId={module.id}
                icon={module.icon}
                iconVariant={module.iconVariant}
                widgetRoute={module.widgetRoute}
                layout="stacked"
                isFavorite={favoriteIds.includes(module.id)}
                favoriteTogglePending={
                  toggleFavorite.isPending &&
                  toggleFavorite.variables?.moduleId === module.id
                }
                onFavoriteToggle={
                  favorites
                    ? () => {
                        const isFavorite = favoriteIds.includes(module.id)
                        toggleFavorite.mutate({
                          moduleId: module.id,
                          moduleIds: favoriteIds,
                          favorite: !isFavorite,
                        })
                      }
                    : undefined
                }
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <ModulesComingSoonSection />
    </Stack>
  )
}
