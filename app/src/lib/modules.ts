import type { LucideIcon } from 'lucide-react'
import { CircleDot, Gift } from 'lucide-react'

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
  {
    id: 'wheel-of-fortune',
    name: 'Wheel of Fortune',
    description:
      'Spin-the-wheel chat game for Kick streams — prize segments and overlay coming later.',
    status: 'coming_soon',
    icon: CircleDot,
    iconVariant: 'primary',
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
