import {
  BONUS_BUY_ROUTE,
  CHAT_ROLL_ROUTE,
  MODULES_ROUTE,
  PRIZE_SPIN_ROUTE,
} from '@/lib/routes'

export type BreadcrumbItem = {
  label: string
  to?: string
}

export function buildBreadcrumbs(
  pathname: string,
  dynamicLabel?: string | null,
): BreadcrumbItem[] {
  const home: BreadcrumbItem = { label: 'Home', to: '/dashboard' }

  switch (pathname) {
    case '/dashboard':
      return [{ label: 'Home' }]
    case '/team':
      return [home, { label: 'Team' }]
    case MODULES_ROUTE:
      return [home, { label: 'Widgets' }]
    case '/subscription':
      return [home, { label: 'Subscription' }]
    case BONUS_BUY_ROUTE:
      return [home, { label: 'Widgets', to: MODULES_ROUTE }, { label: 'Bonus Buy' }]
    case PRIZE_SPIN_ROUTE:
      return [home, { label: 'Widgets', to: MODULES_ROUTE }, { label: 'Prize Spin' }]
    case CHAT_ROLL_ROUTE:
      return [home, { label: 'Widgets', to: MODULES_ROUTE }, { label: 'Chat Roll' }]
    default:
      break
  }

  if (pathname.startsWith(`${BONUS_BUY_ROUTE}/`)) {
    return [
      home,
      { label: 'Widgets', to: MODULES_ROUTE },
      { label: 'Bonus Buy', to: BONUS_BUY_ROUTE },
      { label: dynamicLabel ?? 'Session' },
    ]
  }

  if (pathname.startsWith(`${PRIZE_SPIN_ROUTE}/`)) {
    return [
      home,
      { label: 'Widgets', to: MODULES_ROUTE },
      { label: 'Prize Spin', to: PRIZE_SPIN_ROUTE },
      { label: dynamicLabel ?? 'Session' },
    ]
  }

  if (pathname.startsWith(`${CHAT_ROLL_ROUTE}/`)) {
    return [
      home,
      { label: 'Widgets', to: MODULES_ROUTE },
      { label: 'Chat Roll', to: CHAT_ROLL_ROUTE },
      { label: dynamicLabel ?? 'Session' },
    ]
  }

  return [{ label: 'Home', to: '/dashboard' }]
}

export function getBreadcrumbAncestors(
  pathname: string,
  dynamicLabel?: string | null,
): BreadcrumbItem[] {
  if (pathname === '/dashboard') {
    return []
  }

  const items = buildBreadcrumbs(pathname, dynamicLabel)

  if (items.length <= 1) {
    return []
  }

  return items.slice(0, -1)
}
