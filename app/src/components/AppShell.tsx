import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ListItemButton from '@mui/material/ListItemButton'
import Typography from '@mui/material/Typography'
import type { SvgIconComponent } from '@mui/icons-material'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ExtensionIcon from '@mui/icons-material/Extension'
import GroupIcon from '@mui/icons-material/Group'
import LogoutIcon from '@mui/icons-material/Logout'
import { styled } from '@mui/material/styles'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BrandHeader } from '@/components/BrandHeader'
import { BreadcrumbProvider } from '@/context/BreadcrumbContext'
import { useAuth } from '@/context/AuthContext'

type NavItem = {
  to: string
  label: string
  icon: SvgIconComponent
  end: boolean
  requiresAccount: boolean
  requiresOwner?: boolean
}

const navItems: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Home',
    icon: DashboardIcon,
    end: true,
    requiresAccount: false,
  },
  {
    to: '/modules',
    label: 'Modules',
    icon: ExtensionIcon,
    end: true,
    requiresAccount: true,
  },
  {
    to: '/team',
    label: 'Team',
    icon: GroupIcon,
    end: true,
    requiresAccount: true,
    requiresOwner: true,
  },
  {
    to: '/subscription',
    label: 'Subscription',
    icon: CreditCardIcon,
    end: true,
    requiresAccount: true,
    requiresOwner: true,
  },
]

const ShellRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100svh',
  flexDirection: 'column',
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
  },
}))

const MobileHeader = styled('header')(({ theme }) => ({
  display: 'block',
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}))

const MobileHeaderInner = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 2),
}))

const MobileLogoutButton = styled(Button)({
  minWidth: 0,
  paddingLeft: 8,
  paddingRight: 8,
})

const StyledLogoutIcon = styled(LogoutIcon)({
  fontSize: 16,
})

const MobileNav = styled('nav')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  overflowX: 'auto',
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
  padding: theme.spacing(1),
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}))

const SidebarRouterLink = styled(NavLink)({
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
})

const MobileRouterLink = styled(NavLink)({
  textDecoration: 'none',
  color: 'inherit',
  flex: 1,
  minWidth: 0,
})

const SidebarNavButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  gap: theme.spacing(1),
  padding: theme.spacing(1, 1.5),
}))

const MobileNavButton = styled(ListItemButton)(({ theme }) => ({
  flex: 1,
  borderRadius: theme.shape.borderRadius,
  gap: theme.spacing(0.75),
  padding: theme.spacing(0.75, 1),
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.text.primary,
  },
}))

const DisabledMobileNavButton = styled(ListItemButton)(({ theme }) => ({
  flex: 1,
  borderRadius: theme.shape.borderRadius,
  gap: theme.spacing(0.75),
  padding: theme.spacing(0.75, 1),
  opacity: 0.5,
  color: theme.palette.text.secondary,
}))

const NavIconSlot = styled('span')({
  display: 'inline-flex',
  flexShrink: 0,
  fontSize: 16,
  '& .MuiSvgIcon-root': {
    fontSize: 16,
  },
})

const Sidebar = styled('aside')(({ theme }) => ({
  display: 'none',
  width: 224,
  flexDirection: 'column',
  borderRight: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}))

const SidebarNavList = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}))

const DisabledSidebarNavButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  gap: theme.spacing(1),
  padding: theme.spacing(1, 1.5),
  justifyContent: 'flex-start',
  opacity: 0.5,
  color: theme.palette.text.secondary,
}))

const SidebarFooter = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  paddingTop: theme.spacing(2),
}))

const SidebarLogoutButton = styled(Button)({
  justifyContent: 'flex-start',
})

const MainColumn = styled(Box)({
  display: 'flex',
  minHeight: 0,
  flex: 1,
  flexDirection: 'column',
})

const MainContent = styled('main')(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(3),
}))

const MainInner = styled(Box)({
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '100%',
  maxWidth: 1024,
})

function ShellBrand({ compact = false }: { compact?: boolean }) {
  return <BrandHeader compact={compact} horizontal={compact} />
}

function SidebarNavLink({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string
  label: string
  icon: SvgIconComponent
  end: boolean
}) {
  return (
    <SidebarRouterLink to={to} end={end}>
      {({ isActive }) => (
        <SidebarNavButton selected={isActive}>
          <NavIconSlot>
            <Icon aria-hidden />
          </NavIconSlot>
          <Typography variant="body2">{label}</Typography>
        </SidebarNavButton>
      )}
    </SidebarRouterLink>
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
  icon: SvgIconComponent
  end: boolean
}) {
  return (
    <MobileRouterLink to={to} end={end}>
      {({ isActive }) => (
        <MobileNavButton selected={isActive}>
          <NavIconSlot>
            <Icon aria-hidden />
          </NavIconSlot>
          <Typography variant="body2" noWrap>
            {label}
          </Typography>
        </MobileNavButton>
      )}
    </MobileRouterLink>
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
    <ShellRoot>
      <MobileHeader>
        <MobileHeaderInner>
          <ShellBrand compact />
          <MobileLogoutButton
            type="button"
            variant="text"
            size="small"
            onClick={() => void handleLogout()}
          >
            <StyledLogoutIcon aria-hidden />
          </MobileLogoutButton>
        </MobileHeaderInner>
      </MobileHeader>

      <MobileNav>
        {visibleNavItems.map((item) => {
          const disabled = item.requiresAccount && !hasAccount

          if (disabled) {
            return (
              <DisabledMobileNavButton key={item.to} disabled>
                <NavIconSlot>
                  <item.icon aria-hidden />
                </NavIconSlot>
                <Typography variant="body2" noWrap>
                  {item.label}
                </Typography>
              </DisabledMobileNavButton>
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
      </MobileNav>

      <Sidebar>
        <ShellBrand compact />
        <SidebarNavList>
          {visibleNavItems.map((item) => {
            const disabled = item.requiresAccount && !hasAccount

            if (disabled) {
              return (
                <DisabledSidebarNavButton key={item.to} disabled>
                  <NavIconSlot>
                    <item.icon aria-hidden />
                  </NavIconSlot>
                  <Typography variant="body2">{item.label}</Typography>
                </DisabledSidebarNavButton>
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
        </SidebarNavList>
        <SidebarFooter>
          <SidebarLogoutButton
            type="button"
            variant="text"
            fullWidth
            onClick={() => void handleLogout()}
            startIcon={<StyledLogoutIcon aria-hidden />}
          >
            Sign out
          </SidebarLogoutButton>
        </SidebarFooter>
      </Sidebar>

      <MainColumn>
        <MainContent>
          <BreadcrumbProvider>
            <MainInner>
              <Outlet />
            </MainInner>
          </BreadcrumbProvider>
        </MainContent>
      </MainColumn>
    </ShellRoot>
  )
}
