import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ListItemButton from '@mui/material/ListItemButton'
import Typography from '@mui/material/Typography'
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Puzzle,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BrandHeader } from '@/components/BrandHeader'
import { BreadcrumbProvider } from '@/context/BreadcrumbContext'
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
    to: '/modules',
    label: 'Modules',
    icon: Puzzle,
    end: true,
    requiresAccount: true,
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
    to: '/subscription',
    label: 'Subscription',
    icon: CreditCard,
    end: true,
    requiresAccount: true,
    requiresOwner: true,
  },
]

function ShellBrand({ compact = false }: { compact?: boolean }) {
  return (
    <BrandHeader compact={compact} horizontal={compact} />
  )
}

function SidebarNavLink({
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
    <NavLink
      to={to}
      end={end}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      {({ isActive }) => (
        <ListItemButton
          selected={isActive}
          sx={{
            borderRadius: 1,
            gap: 1,
            px: 1.5,
            py: 1,
          }}
        >
          <Icon size={16} aria-hidden style={{ flexShrink: 0 }} />
          <Typography variant="body2">{label}</Typography>
        </ListItemButton>
      )}
    </NavLink>
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
    <NavLink
      to={to}
      end={end}
      style={{ textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0 }}
    >
      {({ isActive }) => (
        <ListItemButton
          selected={isActive}
          sx={{
            flex: 1,
            borderRadius: 1,
            gap: 0.75,
            px: 1,
            py: 0.75,
            color: isActive ? 'text.primary' : 'text.secondary',
          }}
        >
          <Icon size={16} aria-hidden style={{ flexShrink: 0 }} />
          <Typography variant="body2" noWrap>
            {label}
          </Typography>
        </ListItemButton>
      )}
    </NavLink>
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
    <Box
      sx={{
        display: 'flex',
        minHeight: '100svh',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      <Box
        component="header"
        sx={{
          display: { xs: 'block', md: 'none' },
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
          }}
        >
          <ShellBrand compact />
          <Button
            type="button"
            variant="text"
            size="small"
            onClick={() => void handleLogout()}
            sx={{ minWidth: 0, px: 1 }}
          >
            <LogOut size={16} aria-hidden />
          </Button>
        </Box>
      </Box>

      <Box
        component="nav"
        sx={{
          display: { xs: 'flex', md: 'none' },
          gap: 0.5,
          overflowX: 'auto',
          borderBottom: 1,
          borderColor: 'divider',
          px: 1,
          py: 1,
        }}
      >
        {visibleNavItems.map((item) => {
          const disabled = item.requiresAccount && !hasAccount

          if (disabled) {
            return (
              <ListItemButton
                key={item.to}
                disabled
                sx={{
                  flex: 1,
                  borderRadius: 1,
                  gap: 0.75,
                  px: 1,
                  py: 0.75,
                  opacity: 0.5,
                  color: 'text.secondary',
                }}
              >
                <item.icon size={16} aria-hidden style={{ flexShrink: 0 }} />
                <Typography variant="body2" noWrap>
                  {item.label}
                </Typography>
              </ListItemButton>
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
      </Box>
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: 224,
          flexDirection: 'column',
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 2,
        }}
      >
        <ShellBrand compact />
        <Box sx={{ mb: 2, mt: 3, display: 'flex', flex: 1, flexDirection: 'column', gap: 0.5 }}>
          {visibleNavItems.map((item) => {
            const disabled = item.requiresAccount && !hasAccount

            if (disabled) {
              return (
                <ListItemButton
                  key={item.to}
                  disabled
                  sx={{
                    borderRadius: 1,
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    justifyContent: 'flex-start',
                    opacity: 0.5,
                    color: 'text.secondary',
                  }}
                >
                  <item.icon size={16} aria-hidden style={{ flexShrink: 0 }} />
                  <Typography variant="body2">{item.label}</Typography>
                </ListItemButton>
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
        </Box>
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Button
            type="button"
            variant="text"
            fullWidth
            onClick={() => void handleLogout()}
            startIcon={<LogOut size={16} aria-hidden />}
            sx={{ justifyContent: 'flex-start' }}
          >
            Sign out
          </Button>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', minHeight: 0, flex: 1, flexDirection: 'column' }}>
        <Box component="main" sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          <BreadcrumbProvider>
            <Box sx={{ mx: 'auto', width: '100%', maxWidth: 1024 }}>
              <Outlet />
            </Box>
          </BreadcrumbProvider>
        </Box>
      </Box>
    </Box>
  )
}
