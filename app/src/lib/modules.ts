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
  FIRST_REACTION_ROUTE,
  MEDIA_INTERACTIVE_ROUTE,
  PRIZE_SPIN_ROUTE,
} from '@/lib/routes'

/** Modules with account module sessions (history + /:id workspace). */
export type ModuleSessionPageId =
  | 'bonus-buy'
  | 'prize-spin'
  | 'chat-roll'
  | 'first-reaction'

/** All modules that have a dedicated operator page in the app. */
export type ModulePageId =
  | ModuleSessionPageId
  | 'media-interactive'
  | 'first-reaction'

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

export const DEFAULT_FAVORITE_MODULE_IDS = [
  'bonus-buy',
  'prize-spin',
  'chat-roll',
] as const

/** Catalog entries eligible for nav shortcuts (available + route). */
export function getNavEligibleModules(): ModuleDefinition[] {
  return MODULE_CATALOG.filter(
    (module) => module.status === 'available' && module.widgetRoute,
  )
}

/** Resolve favorite module ids to catalog definitions, preserving order. */
export function getFavoriteNavModules(moduleIds: string[]): ModuleDefinition[] {
  const eligible = new Map(
    getNavEligibleModules().map((module) => [module.id, module]),
  )
  const seen = new Set<string>()
  const result: ModuleDefinition[] = []
  for (const id of moduleIds) {
    if (seen.has(id)) {
      continue
    }
    const module = eligible.get(id)
    if (!module) {
      continue
    }
    seen.add(id)
    result.push(module)
  }
  return result
}

/** @deprecated Use getNavEligibleModules or getFavoriteNavModules */
export function getAvailableNavModules(): ModuleDefinition[] {
  return getNavEligibleModules()
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
  {
    id: 'media-interactive',
    status: 'available',
    icon: YouTubeIcon,
    iconVariant: 'danger',
    widgetRoute: MEDIA_INTERACTIVE_ROUTE,
    hasToggle: false,
  },
  {
    id: 'first-reaction',
    status: 'available',
    icon: BoltIcon,
    iconVariant: 'warning',
    widgetRoute: FIRST_REACTION_ROUTE,
    hasToggle: false,
  },
]

/** Planned widgets on `/modules` — coming soon, no catalog routes. */
export const COMING_SOON_WIDGET_CATALOG: ModuleDefinition[] = [
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

