import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Puzzle,
  Settings,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BrandHeader } from '@/components/BrandHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  end: boolean
  requiresAccount: boolean
  requiresOwner?: boolean
}

const navItems: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Home',
    icon: LayoutDashboard,
    end: true,
    requiresAccount: false,
  },
  {
    to: '/team',
    label: 'Team',
    icon: Users,
    end: true,
    requiresAccount: true,
    requiresOwner: true,
  },
  {
    to: '/modules',
    label: 'Modules',
    icon: Puzzle,
    end: true,
    requiresAccount: true,
  },
  {
    to: '/subscription',
    label: 'Subscription',
    icon: CreditCard,
    end: true,
    requiresAccount: true,
    requiresOwner: true,
  },
]

const futureNavItems = [{ label: 'Settings', icon: Settings }] as const

function ShellBrand({ compact = false }: { compact?: boolean }) {
  return (
    <BrandHeader
      compact={compact}
      className={compact ? 'flex-row items-center text-left' : undefined}
    />
  )
}

function SidebarNavLink({
  to,
  label,
  icon: Icon,
  end,
  className,
}: {
  to: string
  label: string
  icon: LucideIcon
  end: boolean
  className?: string
}) {
  return (
    <Button asChild variant="ghost" className={cn('w-full justify-start gap-2', className)}>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          cn(isActive && 'bg-accent text-accent-foreground')
        }
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        {label}
      </NavLink>
    </Button>
  )
}

function MobileNavLink({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string
  label: string
  icon: LucideIcon
  end: boolean
}) {
  return (
    <Button asChild variant="ghost" size="sm" className="flex-1 gap-1.5">
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          cn(
            'w-full',
            isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
          )
        }
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className="truncate">{label}</span>
      </NavLink>
    </Button>
  )
}

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  const hasAccount = Boolean(user?.accountId)
  const visibleNavItems = navItems.filter(
    (item) => !item.requiresOwner || user?.role === 'owner',
  )

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <header className="border-b bg-card md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <ShellBrand compact />
          <Button type="button" variant="ghost" size="sm" onClick={() => void handleLogout()}>
            <LogOut className="size-4" aria-hidden />
          </Button>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b px-2 py-2 md:hidden">
        {visibleNavItems.map((item) => {
          const disabled = item.requiresAccount && !hasAccount

          if (disabled) {
            return (
              <Button
                key={item.to}
                type="button"
                variant="ghost"
                size="sm"
                className="flex-1 gap-1.5 text-muted-foreground opacity-50"
                disabled
              >
                <item.icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{item.label}</span>
              </Button>
            )
          }

          return (
            <MobileNavLink
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              end={item.end}
            />
          )
        })}
      </nav>

      <aside className="hidden w-56 flex-col border-r bg-card p-4 md:flex">
        <ShellBrand compact />

        <div className="mb-4 mt-6 flex flex-1 flex-col gap-1">
          {visibleNavItems.map((item) => {
            const disabled = item.requiresAccount && !hasAccount

            if (disabled) {
              return (
                <Button
                  key={item.to}
                  type="button"
                  variant="ghost"
                  className="justify-start gap-2 text-muted-foreground opacity-50"
                  disabled
                >
                  <item.icon className="size-4 shrink-0" aria-hidden />
                  {item.label}
                </Button>
              )
            }

            return (
              <SidebarNavLink
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                end={item.end}
              />
            )
          })}

          <Separator className="my-2" />

          {futureNavItems.map((item) => (
            <Button
              key={item.label}
              type="button"
              variant="ghost"
              className="justify-between gap-2 text-muted-foreground opacity-60"
              disabled
            >
              <span className="flex items-center gap-2">
                <item.icon className="size-4 shrink-0" aria-hidden />
                {item.label}
              </span>
              <Badge variant="secondary">Soon</Badge>
            </Button>
          ))}
        </div>

        {user ? (
          <div className="mb-3 rounded-lg border bg-background/60 p-3">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.accountName ?? 'No team'}
            </p>
          </div>
        ) : null}

        <div className="mt-auto space-y-2 pt-4">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => void handleLogout()}
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
