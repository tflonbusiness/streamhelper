import { MODULE_CATALOG } from '@/lib/modules'

export const chatRollModule = MODULE_CATALOG.find(
  (module) => module.id === 'chat-roll',
)!
