import type { SvgIconComponent } from '@mui/icons-material'
import { PageHeader } from '@/components/PageHeader'
import { useModuleLabels } from '@/hooks/use-module-labels'
import type { ModuleDefinition, ModuleIconVariant } from '@/lib/modules'

type ModuleSessionPageHeaderProps = {
  module: ModuleDefinition | undefined
  action?: React.ReactNode
}

export function ModuleSessionPageHeader({
  module,
  action,
}: ModuleSessionPageHeaderProps) {
  const { name, description } = useModuleLabels(module)

  if (!module) {
    return null
  }

  const Icon = module.icon as SvgIconComponent

  return (
    <PageHeader
      title={name}
      description={description}
      icon={Icon}
      iconVariant={module.iconVariant as ModuleIconVariant}
      action={action}
    />
  )
}
