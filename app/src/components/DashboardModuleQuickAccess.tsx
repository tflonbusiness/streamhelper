import Grid from '@mui/material/Grid'
import { useTranslation } from 'react-i18next'
import { DashboardSection } from '@/components/DashboardSection'
import { ModuleCatalogCard } from '@/components/ModuleCatalogCard'
import { getAvailableNavModules } from '@/lib/modules'

export function DashboardModuleQuickAccess() {
  const { t } = useTranslation()
  const modules = getAvailableNavModules()

  if (modules.length === 0) {
    return null
  }

  return (
    <DashboardSection
      title={t('dashboard.modulesQuickAccessTitle')}
      variant="panel"
      headerInPanel
    >
      <Grid container spacing={2}>
        {modules.map((module) => (
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
    </DashboardSection>
  )
}
