import type { SvgIconComponent } from '@mui/icons-material'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import CasinoIcon from '@mui/icons-material/Casino'
import YouTubeIcon from '@mui/icons-material/YouTube'
import BoltIcon from '@mui/icons-material/Bolt'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import BalanceIcon from '@mui/icons-material/Balance'
import ApartmentIcon from '@mui/icons-material/Apartment'
import LockIcon from '@mui/icons-material/Lock'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import {
  BONUS_BUY_ROUTE,
  CHAT_ROLL_ROUTE,
  PRIZE_SPIN_ROUTE,
} from '@/lib/routes'

/** Modules with account module sessions (history + /:id workspace). */
export type ModuleSessionPageId = 'bonus-buy' | 'prize-spin' | 'chat-roll'

/** All modules that have a dedicated operator page in the app. */
export type ModulePageId = ModuleSessionPageId | 'media-interactive'

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
  status: ModuleCatalogStatus
  icon: SvgIconComponent
  iconVariant: ModuleIconVariant
  widgetRoute?: string
  hasToggle?: boolean
}

/** Modules shown as sidebar quick links under Modules (catalog `available` only). */
export function getAvailableNavModules(): ModuleDefinition[] {
  return MODULE_CATALOG.filter(
    (module) => module.status === 'available' && module.widgetRoute,
  )
}

export const MODULE_CATALOG: ModuleDefinition[] = [
  {
    id: 'bonus-buy',
    status: 'available',
    icon: CardGiftcardIcon,
    iconVariant: 'warning',
    widgetRoute: BONUS_BUY_ROUTE,
    hasToggle: false,
  },
  {
    id: 'prize-spin',
    status: 'available',
    icon: AutorenewIcon,
    iconVariant: 'purple',
    widgetRoute: PRIZE_SPIN_ROUTE,
    hasToggle: false,
  },
  {
    id: 'chat-roll',
    status: 'available',
    icon: CasinoIcon,
    iconVariant: 'info',
    widgetRoute: CHAT_ROLL_ROUTE,
    hasToggle: false,
  },
]

/** Planned widgets on `/modules` — coming soon, no catalog routes. */
export const COMING_SOON_WIDGET_CATALOG: ModuleDefinition[] = [
  {
    id: 'media-interactive',
    status: 'coming_soon',
    icon: YouTubeIcon,
    iconVariant: 'danger',
  },
  {
    id: 'first-reaction',
    status: 'coming_soon',
    icon: BoltIcon,
    iconVariant: 'warning',
  },
  {
    id: 'growing-jackpot',
    status: 'coming_soon',
    icon: TrendingUpIcon,
    iconVariant: 'success',
  },
  {
    id: 'red-vs-black',
    status: 'coming_soon',
    icon: BalanceIcon,
    iconVariant: 'danger',
  },
  {
    id: 'tower',
    status: 'coming_soon',
    icon: ApartmentIcon,
    iconVariant: 'info',
  },
  {
    id: 'safe-crack',
    status: 'coming_soon',
    icon: LockIcon,
    iconVariant: 'purple',
  },
  {
    id: 'limit-50',
    status: 'coming_soon',
    icon: HourglassTopIcon,
    iconVariant: 'primary',
  },
  {
    id: 'marathon',
    status: 'coming_soon',
    icon: DirectionsRunIcon,
    iconVariant: 'muted',
  },
]

export function getModuleDefinition(moduleId: string): ModuleDefinition | undefined {
  return (
    MODULE_CATALOG.find((module) => module.id === moduleId) ??
    COMING_SOON_WIDGET_CATALOG.find((module) => module.id === moduleId)
  )
}

export function moduleNameKey(moduleId: string): string {
  return `modules.catalog.${moduleId}.name`
}

export function moduleDescriptionKey(moduleId: string): string {
  return `modules.catalog.${moduleId}.description`
}

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
