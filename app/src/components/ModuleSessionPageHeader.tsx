import type { SvgIconComponent } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/PageHeader'
import type { ModuleDefinition, ModuleIconVariant, ModulePageId } from '@/lib/modules'

type ModuleSessionPageHeaderProps = {
  module: ModuleDefinition | undefined
  action?: React.ReactNode
  omitBreadcrumbBar?: boolean
}

export const MODULE_SESSION_PAGE_COPY: Record<
  ModulePageId,
  { titleKey: string; descriptionKey: string }
> = {
  'bonus-buy': {
    titleKey: 'bonusBuy.title',
    descriptionKey: 'bonusBuy.description',
  },
  'prize-spin': {
    titleKey: 'prizeSpin.title',
    descriptionKey: 'prizeSpin.description',
  },
  'chat-roll': {
    titleKey: 'chatRoll.title',
    descriptionKey: 'chatRoll.description',
  },
}

export function moduleSessionPageTitle(
  module: ModuleDefinition,
  t: (key: string) => string,
) {
  const copy = MODULE_SESSION_PAGE_COPY[module.id as ModulePageId]
  return copy ? t(copy.titleKey) : ''
}

export function ModuleSessionPageHeader({
  module,
  action,
  omitBreadcrumbBar = false,
}: ModuleSessionPageHeaderProps) {
  const { t } = useTranslation()

  if (!module) {
    return null
  }

  const copy = MODULE_SESSION_PAGE_COPY[module.id as ModulePageId]
  const title = copy ? t(copy.titleKey) : ''
  const description = copy ? t(copy.descriptionKey) : undefined

  const Icon = module.icon as SvgIconComponent

  return (
    <PageHeader
      title={title}
      description={description}
      icon={Icon}
      iconVariant={module.iconVariant as ModuleIconVariant}
      moduleSurface
      action={action}
      omitBreadcrumbBar={omitBreadcrumbBar}
    />
  )
}
