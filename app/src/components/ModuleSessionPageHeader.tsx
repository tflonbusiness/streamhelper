import type { SvgIconComponent } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/PageHeader'
import type { ModuleDefinition, ModuleIconVariant, ModulePageId } from '@/lib/modules'

const SESSION_MODULE_PAGE_COPY: Record<
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

type ModuleSessionPageHeaderProps = {
  module: ModuleDefinition | undefined
  action?: React.ReactNode
}

export function ModuleSessionPageHeader({
  module,
  action,
}: ModuleSessionPageHeaderProps) {
  const { t } = useTranslation()

  if (!module) {
    return null
  }

  const copy = SESSION_MODULE_PAGE_COPY[module.id as ModulePageId]
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
      moduleId={module.id as ModulePageId}
      action={action}
    />
  )
}
