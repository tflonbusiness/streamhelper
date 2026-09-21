import type { SvgIconComponent } from '@mui/icons-material'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import CasinoIcon from '@mui/icons-material/Casino'
import {
  BONUS_BUY_ROUTE,
  CHAT_ROLL_ROUTE,
  PRIZE_SPIN_ROUTE,
} from '@/lib/routes'

export type ModuleCatalogStatus = 'available' | 'coming_soon'

export type ModuleIconVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'muted'

export type ModuleDefinition = {
  id: string
  name: string
  description: string
  status: ModuleCatalogStatus
  icon: SvgIconComponent
  iconVariant: ModuleIconVariant
  widgetRoute?: string
  hasToggle?: boolean
}

export const MODULE_CATALOG: ModuleDefinition[] = [
  {
    id: 'bonus-buy',
    name: 'Bonus Buy',
    description:
      'Slot bonus-buy rounds for stream engagement — viewers trigger bonus features during live play.',
    status: 'available',
    icon: CardGiftcardIcon,
    iconVariant: 'warning',
    widgetRoute: BONUS_BUY_ROUTE,
    hasToggle: false,
  },
  {
    id: 'prize-spin',
    name: 'Prize Spin',
    description:
      'Spin a weighted prize wheel for a viewer — enter their chat nick, set prize sectors and odds, show the result on stream.',
    status: 'available',
    icon: AutorenewIcon,
    iconVariant: 'purple',
    widgetRoute: PRIZE_SPIN_ROUTE,
    hasToggle: false,
  },
  {
    id: 'chat-roll',
    name: 'Chat Roll',
    description:
      'Weighted chat giveaway — viewers join with a keyword; pick a random winner with VIP and subscriber boost.',
    status: 'available',
    icon: CasinoIcon,
    iconVariant: 'info',
    widgetRoute: CHAT_ROLL_ROUTE,
    hasToggle: false,
  },
]

function storageKey(accountId: number) {
  return `caz-modules-${accountId}`
}

export function getEnabledModuleIds(accountId: number): string[] {
  try {
    const raw = localStorage.getItem(storageKey(accountId))
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((id): id is string => typeof id === 'string')
  } catch {
    return []
  }
}

export function isModuleEnabled(accountId: number, moduleId: string): boolean {
  return getEnabledModuleIds(accountId).includes(moduleId)
}

export function setModuleEnabled(
  accountId: number,
  moduleId: string,
  enabled: boolean,
): string[] {
  const current = new Set(getEnabledModuleIds(accountId))
  if (enabled) {
    current.add(moduleId)
  } else {
    current.delete(moduleId)
  }
  const next = [...current]
  localStorage.setItem(storageKey(accountId), JSON.stringify(next))
  return next
}

export function countEnabledModules(accountId: number): number {
  return getEnabledModuleIds(accountId).length
}
