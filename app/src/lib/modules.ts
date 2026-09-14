import type { LucideIcon } from 'lucide-react'
import {
  Dices,
  Gift,
  History,
  MonitorPlay,
  Radio,
} from 'lucide-react'

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
  icon: LucideIcon
  iconVariant: ModuleIconVariant
  widgetRoute?: string
  hasToggle?: boolean
}

export const MODULE_CATALOG: ModuleDefinition[] = [
  {
    id: 'casino-stream-games',
    name: 'CasinoStream — Games',
    description:
      'Interactive Kick chat games library with overlay and one winner per round.',
    status: 'available',
    icon: Dices,
    iconVariant: 'primary',
  },
  {
    id: 'obs-overlay',
    name: 'OBS Overlay',
    description: 'Browser source for displaying game state on stream.',
    status: 'coming_soon',
    icon: MonitorPlay,
    iconVariant: 'purple',
  },
  {
    id: 'round-history',
    name: 'Round History',
    description: 'Log of rounds, winners, and payout statuses.',
    status: 'coming_soon',
    icon: History,
    iconVariant: 'info',
  },
  {
    id: 'kick-integration',
    name: 'Kick Integration',
    description: 'Kick channel connection and chat command handling.',
    status: 'coming_soon',
    icon: Radio,
    iconVariant: 'success',
  },
  {
    id: 'bonus-buy',
    name: 'Bonus Buy',
    description:
      'Slot bonus-buy rounds for stream engagement — viewers trigger bonus features during live play.',
    status: 'available',
    icon: Gift,
    iconVariant: 'warning',
    widgetRoute: '/bonus-buy',
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
