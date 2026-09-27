import { useTranslation } from 'react-i18next'
import {
  moduleDescriptionKey,
  moduleNameKey,
  type ModuleDefinition,
} from '@/lib/modules'

export function useModuleLabels(module: ModuleDefinition | undefined) {
  const { t } = useTranslation()

  if (!module) {
    return {
      name: '',
      description: '',
    }
  }

  return {
    name: t(moduleNameKey(module.id)),
    description: t(moduleDescriptionKey(module.id)),
  }
}
