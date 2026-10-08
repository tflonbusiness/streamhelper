import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import { useTranslation } from 'react-i18next'
import { ModuleCatalogCard } from '@/components/ModuleCatalogCard'
import { PageHeader } from '@/components/PageHeader'
import { MODULE_PAGE_SECTION_SPACING } from '@/lib/module-page-layout'
import { MODULE_CATALOG } from '@/lib/modules'

export function ModulesPage() {
  const { t } = useTranslation()

  return (
    <Stack spacing={MODULE_PAGE_SECTION_SPACING}>
      <PageHeader
        title={t('modules.pageTitle')}
        description={t('modules.pageDescription')}
        icon={SportsEsportsIcon}
        iconVariant="primary"
      />
      <Grid container spacing={2}>
        {MODULE_CATALOG.map((module) => {
          const isAvailable = module.status === 'available'

          return (
            <Grid key={module.id} size={{ xs: 12, sm: 6 }}>
              <ModuleCatalogCard
                moduleId={module.id}
                icon={module.icon}
                iconVariant={module.iconVariant}
                widgetRoute={module.widgetRoute}
                available={isAvailable}
              />
            </Grid>
          )
        })}
      </Grid>
    </Stack>
  )
}
