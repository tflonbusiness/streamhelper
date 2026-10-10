import type { SvgIconComponent } from '@mui/icons-material'
import { PageHeader } from '@/components/PageHeader'
import type { ModulePageId } from '@/lib/modules'
import { getModuleDefinition } from '@/lib/modules'
import type { ModuleIconVariant } from '@/lib/modules'

type ModulePageHeaderProps = {
  moduleId: ModulePageId
  title: string
  description?: string
  action?: React.ReactNode
}

export function ModulePageHeader({
  moduleId,
  title,
  description,
  action,
}: ModulePageHeaderProps) {
  const module = getModuleDefinition(moduleId)

  if (!module) {
    return null
  }

  const Icon = module.icon as SvgIconComponent

  return (
    <PageHeader
      title={title}
      description={description}
      icon={Icon}
      iconVariant={module.iconVariant as ModuleIconVariant}
      moduleSurface
      action={action}
    />
  )
}
