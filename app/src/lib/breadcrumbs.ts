import type { TFunction } from 'i18next'
import {
  BONUS_BUY_ROUTE,
  CHAT_ROLL_ROUTE,
  MODULES_ROUTE,
  PRIZE_SPIN_ROUTE,
} from '@/lib/routes'

export type BreadcrumbItem = {
  labelKey?: string
  label?: string
  to?: string
}

function sessionLabel(t: TFunction, dynamicLabel?: string | null): string {
  return dynamicLabel?.trim() ? dynamicLabel.trim() : t('common.session')
}

export function buildBreadcrumbs(
  pathname: string,
  t: TFunction,
  dynamicLabel?: string | null,
): BreadcrumbItem[] {
  const home: BreadcrumbItem = { labelKey: 'nav.home', to: '/dashboard' }

  switch (pathname) {
    case '/dashboard':
      return [{ labelKey: 'nav.home' }]
    case '/team':
      return [home, { labelKey: 'nav.team' }]
    case MODULES_ROUTE:
      return [home, { labelKey: 'nav.widgets' }]
    case '/subscription':
      return [home, { labelKey: 'nav.subscription' }]
    case BONUS_BUY_ROUTE:
      return [
        home,
        { labelKey: 'nav.widgets', to: MODULES_ROUTE },
        { labelKey: 'nav.bonusBuy' },
      ]
    case PRIZE_SPIN_ROUTE:
      return [
        home,
        { labelKey: 'nav.widgets', to: MODULES_ROUTE },
        { labelKey: 'nav.prizeSpin' },
      ]
    case CHAT_ROLL_ROUTE:
      return [
        home,
        { labelKey: 'nav.widgets', to: MODULES_ROUTE },
        { labelKey: 'nav.chatRoll' },
      ]
    default:
      break
  }

  if (pathname.startsWith(`${BONUS_BUY_ROUTE}/`)) {
    return [
      home,
      { labelKey: 'nav.widgets', to: MODULES_ROUTE },
      { labelKey: 'nav.bonusBuy', to: BONUS_BUY_ROUTE },
      { label: sessionLabel(t, dynamicLabel) },
    ]
  }

  if (pathname.startsWith(`${PRIZE_SPIN_ROUTE}/`)) {
    return [
      home,
      { labelKey: 'nav.widgets', to: MODULES_ROUTE },
      { labelKey: 'nav.prizeSpin', to: PRIZE_SPIN_ROUTE },
      { label: sessionLabel(t, dynamicLabel) },
    ]
  }

  if (pathname.startsWith(`${CHAT_ROLL_ROUTE}/`)) {
    return [
      home,
      { labelKey: 'nav.widgets', to: MODULES_ROUTE },
      { labelKey: 'nav.chatRoll', to: CHAT_ROLL_ROUTE },
      { label: sessionLabel(t, dynamicLabel) },
    ]
  }

  return [{ labelKey: 'nav.home', to: '/dashboard' }]
}

export function resolveBreadcrumbLabel(item: BreadcrumbItem, t: TFunction): string {
  if (item.label) {
    return item.label
  }
  return item.labelKey ? t(item.labelKey) : ''
}

export function getBreadcrumbAncestors(
  pathname: string,
  t: TFunction,
  dynamicLabel?: string | null,
): Array<BreadcrumbItem & { label: string }> {
  if (pathname === '/dashboard') {
    return []
  }

  const items = buildBreadcrumbs(pathname, t, dynamicLabel)

  if (items.length <= 1) {
    return []
  }

  return items.slice(0, -1).map((item) => ({
    ...item,
    label: resolveBreadcrumbLabel(item, t),
  }))
}
