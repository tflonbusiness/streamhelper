import { MODULE_CATALOG } from '@/lib/modules'

export const firstReactionModule = MODULE_CATALOG.find(
  (module) => module.id === 'first-reaction',
)!
