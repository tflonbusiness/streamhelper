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
    case '/modules':
      return [home, { label: 'Modules' }]
    case '/subscription':
      return [home, { label: 'Subscription' }]
    case '/bonus-buy':
      return [home, { label: 'Modules', to: '/modules' }, { label: 'Bonus Buy' }]
    case '/prize-spin':
      return [home, { label: 'Modules', to: '/modules' }, { label: 'Prize Spin' }]
    case '/chat-roll':
      return [home, { label: 'Modules', to: '/modules' }, { label: 'Chat Roll' }]
    default:
      break
  }

  if (pathname.startsWith('/bonus-buy/')) {
    return [
      home,
      { label: 'Modules', to: '/modules' },
      { label: 'Bonus Buy', to: '/bonus-buy' },
      { label: dynamicLabel ?? 'Session' },
    ]
  }

  if (pathname.startsWith('/prize-spin/')) {
    return [
      home,
      { label: 'Modules', to: '/modules' },
      { label: 'Prize Spin', to: '/prize-spin' },
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
