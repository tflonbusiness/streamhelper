import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import ListItemButton from '@mui/material/ListItemButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import type { SvgIconComponent } from '@mui/icons-material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import DashboardIcon from '@mui/icons-material/Dashboard'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import GroupIcon from '@mui/icons-material/Group'
import LogoutIcon from '@mui/icons-material/Logout'
import { alpha, styled } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { IconTile } from '@/components/IconTile'
import { BreadcrumbProvider } from '@/context/BreadcrumbContext'
import { useAuth } from '@/context/AuthContext'
import {
  getAvailableNavModules,
  moduleNameKey,
  type ModuleIconVariant,
} from '@/lib/modules'
import { MODULES_ROUTE } from '@/lib/routes'
import { colors } from '@/theme/colors'

type NavItem = {
  to: string
  labelKey: string
  icon: SvgIconComponent
  end: boolean
  requiresAccount: boolean
  requiresOwner?: boolean
}

const NAV_EXPANDED_STORAGE_KEY = 'caz-shell-nav-visible'

const SIDEBAR_WIDTH_EXPANDED = 224
const SIDEBAR_WIDTH_COLLAPSED = 64

function loadNavExpanded(): boolean {
  try {
    const raw = localStorage.getItem(NAV_EXPANDED_STORAGE_KEY)
    if (raw === null) {
      return true
    }
    return raw === 'true'
  } catch {
    return true
  }
}

const navItems: NavItem[] = [
  {
    to: '/dashboard',
    labelKey: 'nav.home',
    icon: DashboardIcon,
    end: true,
    requiresAccount: false,
  },
  {
    to: MODULES_ROUTE,
    labelKey: 'nav.widgets',
    icon: SportsEsportsIcon,
    end: false,
    requiresAccount: true,
  },
  {
    to: '/team',
    labelKey: 'nav.team',
    icon: GroupIcon,
    end: true,
    requiresAccount: true,
    requiresOwner: true,
  },
  {
    to: '/subscription',
    labelKey: 'nav.subscription',
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

const MobileNav = styled('nav', {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded?: boolean }>(({ theme }) => ({
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
  minWidth: 0,
})

const SidebarNavButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'collapsed',
})<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
  borderRadius: theme.shape.borderRadius,
  gap: collapsed ? 0 : theme.spacing(1),
  padding: collapsed ? theme.spacing(1) : theme.spacing(1, 1.5),
  justifyContent: collapsed ? 'center' : 'flex-start',
  minHeight: 40,
}))

const MobileNavButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'collapsed',
})<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
  flex: collapsed ? '0 0 auto' : 1,
  borderRadius: theme.shape.borderRadius,
  gap: collapsed ? 0 : theme.spacing(0.75),
  padding: collapsed ? theme.spacing(0.75) : theme.spacing(0.75, 1),
  justifyContent: 'center',
  minWidth: collapsed ? 40 : undefined,
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.text.primary,
  },
}))

const DisabledMobileNavButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'collapsed',
})<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
  flex: collapsed ? '0 0 auto' : 1,
  borderRadius: theme.shape.borderRadius,
  gap: collapsed ? 0 : theme.spacing(0.75),
  padding: collapsed ? theme.spacing(0.75) : theme.spacing(0.75, 1),
  justifyContent: 'center',
  minWidth: collapsed ? 40 : undefined,
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

const Sidebar = styled('aside', {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded?: boolean }>(({ theme, expanded = true }) => ({
  display: 'none',
  width: expanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
  height: '100svh',
  position: 'sticky',
  top: 0,
  alignSelf: 'flex-start',
  flexShrink: 0,
  flexDirection: 'column',
  borderRight: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: theme.palette.background.paper,
  padding: expanded ? theme.spacing(2) : theme.spacing(1),
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shortest,
  }),
  overflow: 'hidden',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}))

const SidebarHeaderRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded?: boolean }>(({ expanded }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: expanded ? 'space-between' : 'center',
  flexDirection: expanded ? 'row' : 'column',
  gap: 8,
}))

const SidebarLogo = styled('img', {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded?: boolean }>(({ expanded }) => ({
  flexShrink: 0,
  width: expanded ? 32 : 28,
  height: expanded ? 32 : 28,
}))

const NavToggleButton = styled(IconButton)(({ theme }) => ({
  flexShrink: 0,
  color: theme.palette.text.secondary,
}))

const SidebarNavList = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded?: boolean }>(({ theme, expanded }) => ({
  marginTop: expanded ? theme.spacing(3) : theme.spacing(2),
  marginBottom: theme.spacing(1),
  display: 'flex',
  flex: 1,
  minHeight: 0,
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  overflowY: 'auto',
  overflowX: 'hidden',
}))

const SidebarModulesGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.25),
  marginBottom: theme.spacing(0.5),
}))

const SidebarSubmoduleList = styled('ul')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.25),
  margin: 0,
  padding: theme.spacing(0, 0.25),
  listStyle: 'none',
}))

const SidebarSubmoduleButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 0.75),
  justifyContent: 'flex-start',
  alignItems: 'center',
  minHeight: 36,
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.text.primary,
    backgroundColor: alpha(colors.purple[500], 0.12),
  },
  '&.Mui-selected:hover': {
    backgroundColor: alpha(colors.purple[500], 0.16),
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.text.primary, 0.04),
  },
}))

const DisabledSidebarNavButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'collapsed',
})<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
  borderRadius: theme.shape.borderRadius,
  gap: collapsed ? 0 : theme.spacing(1),
  padding: collapsed ? theme.spacing(1) : theme.spacing(1, 1.5),
  justifyContent: collapsed ? 'center' : 'flex-start',
  minHeight: 40,
  opacity: 0.5,
  color: theme.palette.text.secondary,
}))

const SidebarFooter = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  marginTop: 'auto',
  paddingTop: theme.spacing(1.5),
  borderTop: '1px solid',
  borderColor: theme.palette.divider,
  display: 'flex',
  justifyContent: 'center',
}))

const SidebarUserRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded?: boolean }>(({ theme, expanded }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  justifyContent: expanded ? 'flex-start' : 'center',
  padding: expanded ? theme.spacing(0, 0.5, 1) : theme.spacing(0, 0, 1),
  minWidth: 0,
}))

const SidebarUserAvatar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: 32,
  height: 32,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(colors.purple[500], 0.12),
  color: colors.purple[400],
  fontSize: '0.75rem',
  fontWeight: 700,
  lineHeight: 1,
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

const DEFAULT_MAIN_MAX_WIDTH = 1024
const WIDE_MAIN_MAX_WIDTH = 1800

const MainContent = styled('main', {
  shouldForwardProp: (prop) => prop !== 'wide',
})<{ wide?: boolean }>(({ theme, wide }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(wide ? 2 : 3),
}))

const MainInner = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'wide',
})<{ wide?: boolean }>(({ wide }) => ({
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '100%',
  maxWidth: wide ? WIDE_MAIN_MAX_WIDTH : DEFAULT_MAIN_MAX_WIDTH,
}))

function SidebarNavLink({
  to,
  label,
  icon: Icon,
  end,
  collapsed,
}: {
  to: string
  label: string
  icon: SvgIconComponent
  end: boolean
  collapsed: boolean
}) {
  const link = (
    <SidebarRouterLink to={to} end={end}>
      {({ isActive }) => (
        <SidebarNavButton selected={isActive} collapsed={collapsed}>
          <NavIconSlot>
            <Icon aria-hidden />
          </NavIconSlot>
          {!collapsed ? <Typography variant="body2">{label}</Typography> : null}
        </SidebarNavButton>
      )}
    </SidebarRouterLink>
  )

  if (collapsed) {
    return <Tooltip title={label} placement="right">{link}</Tooltip>
  }

  return link
}

function SidebarSubmoduleLink({
  to,
  label,
  icon,
  iconVariant,
}: {
  to: string
  label: string
  icon: SvgIconComponent
  iconVariant: ModuleIconVariant
}) {
  return (
    <Box component="li" sx={{ display: 'block' }}>
      <SidebarRouterLink to={to} end={false}>
        {({ isActive }) => (
          <SidebarSubmoduleButton selected={isActive} dense>
            <IconTile icon={icon} variant={iconVariant} size="sm" />
            <Typography
              variant="body2"
              component="span"
              sx={{
                fontSize: '0.8125rem',
                fontWeight: isActive ? 600 : 500,
                lineHeight: 1.3,
                color: 'inherit',
              }}
              noWrap
            >
              {label}
            </Typography>
          </SidebarSubmoduleButton>
        )}
      </SidebarRouterLink>
    </Box>
  )
}

function SidebarModulesNav({
  collapsed,
  disabled,
  icon: Icon,
  label,
}: {
  collapsed: boolean
  disabled: boolean
  icon: SvgIconComponent
  label: string
}) {
  const { t } = useTranslation()
  const submodules = getAvailableNavModules()

  if (disabled) {
    const disabledButton = (
      <DisabledSidebarNavButton disabled collapsed={collapsed}>
        <NavIconSlot>
          <Icon aria-hidden />
        </NavIconSlot>
        {!collapsed ? <Typography variant="body2">{label}</Typography> : null}
      </DisabledSidebarNavButton>
    )

    if (collapsed) {
      return (
        <Tooltip title={label} placement="right">
          <span>{disabledButton}</span>
        </Tooltip>
      )
    }

    return disabledButton
  }

  if (collapsed) {
    return (
      <SidebarNavLink
        to={MODULES_ROUTE}
        label={label}
        icon={Icon}
        end={false}
        collapsed={collapsed}
      />
    )
  }

  return (
    <SidebarModulesGroup>
      <SidebarNavLink
        to={MODULES_ROUTE}
        label={label}
        icon={Icon}
        end={false}
        collapsed={false}
      />
      {submodules.length > 0 ? (
        <SidebarSubmoduleList aria-label={t('common.widgetShortcuts')}>
          {submodules.map((module) => (
            <SidebarSubmoduleLink
              key={module.id}
              to={module.widgetRoute!}
              label={t(moduleNameKey(module.id))}
              icon={module.icon}
              iconVariant={module.iconVariant}
            />
          ))}
        </SidebarSubmoduleList>
      ) : null}
    </SidebarModulesGroup>
  )
}

function MobileNavLink({
  to,
  label,
  icon: Icon,
  end,
  collapsed,
}: {
  to: string
  label: string
  icon: SvgIconComponent
  end: boolean
  collapsed: boolean
}) {
  const link = (
    <MobileRouterLink to={to} end={end} style={{ flex: collapsed ? '0 0 auto' : 1 }}>
      {({ isActive }) => (
        <MobileNavButton selected={isActive} collapsed={collapsed}>
          <NavIconSlot>
            <Icon aria-hidden />
          </NavIconSlot>
          {!collapsed ? (
            <Typography variant="body2" noWrap>
              {label}
            </Typography>
          ) : null}
        </MobileNavButton>
      )}
    </MobileRouterLink>
  )

  if (collapsed) {
    return <Tooltip title={label}>{link}</Tooltip>
  }

  return link
}

export function AppShell() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function navLabel(item: NavItem) {
    return t(item.labelKey)
  }
  const wideMainContent =
    /^\/modules\/(?:bonus-buy|chat-roll|prize-spin)\/\d+(?:\/|$)/.test(
      location.pathname,
    )
  const [isNavExpanded, setIsNavExpanded] = useState(loadNavExpanded)

  useEffect(() => {
    localStorage.setItem(NAV_EXPANDED_STORAGE_KEY, String(isNavExpanded))
  }, [isNavExpanded])

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  const hasAccount = Boolean(user?.accountId)
  const visibleNavItems = navItems.filter(
    (item) => !item.requiresOwner || user?.role === 'owner',
  )
  const isNavCollapsed = !isNavExpanded

  return (
    <ShellRoot>
      <MobileHeader>
        <MobileHeaderInner>
          <Tooltip
            title={
              isNavExpanded
                ? t('common.collapseNavigation')
                : t('common.expandNavigation')
            }
          >
            <NavToggleButton
              size="small"
              aria-label={
                isNavExpanded
                  ? t('common.collapseNavigation')
                  : t('common.expandNavigation')
              }
              onClick={() => setIsNavExpanded((expanded) => !expanded)}
            >
              {isNavExpanded ? (
                <ChevronLeftIcon fontSize="small" />
              ) : (
                <ChevronRightIcon fontSize="small" />
              )}
            </NavToggleButton>
          </Tooltip>
          <SidebarLogo src="/logo.svg" alt={t('common.appName')} expanded />
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

      <MobileNav expanded={isNavExpanded}>
        {visibleNavItems.map((item) => {
          const disabled = item.requiresAccount && !hasAccount

          if (disabled) {
            const disabledButton = (
              <DisabledMobileNavButton key={item.to} disabled collapsed={isNavCollapsed}>
                <NavIconSlot>
                  <item.icon aria-hidden />
                </NavIconSlot>
                {!isNavCollapsed ? (
                  <Typography variant="body2" noWrap>
                    {navLabel(item)}
                  </Typography>
                ) : null}
              </DisabledMobileNavButton>
            )

            if (isNavCollapsed) {
              return (
                <Tooltip key={item.to} title={navLabel(item)}>
                  <span>{disabledButton}</span>
                </Tooltip>
              )
            }

            return disabledButton
          }

          return (
            <MobileNavLink
              key={item.to}
              to={item.to}
              label={navLabel(item)}
              icon={item.icon}
              end={item.end}
              collapsed={isNavCollapsed}
            />
          )
        })}
      </MobileNav>

      <Sidebar expanded={isNavExpanded}>
        <SidebarHeaderRow expanded={isNavExpanded}>
          <SidebarLogo
            src="/logo.svg"
            alt={t('common.appName')}
            expanded={isNavExpanded}
          />
          <Tooltip
            title={
              isNavExpanded
                ? t('common.collapseNavigation')
                : t('common.expandNavigation')
            }
          >
            <NavToggleButton
              size="small"
              aria-label={
                isNavExpanded
                  ? t('common.collapseNavigation')
                  : t('common.expandNavigation')
              }
              onClick={() => setIsNavExpanded((expanded) => !expanded)}
            >
              {isNavExpanded ? (
                <ChevronLeftIcon fontSize="small" />
              ) : (
                <ChevronRightIcon fontSize="small" />
              )}
            </NavToggleButton>
          </Tooltip>
        </SidebarHeaderRow>
        <SidebarNavList expanded={isNavExpanded}>
          {visibleNavItems.map((item) => {
            const disabled = item.requiresAccount && !hasAccount

            if (disabled) {
              const disabledButton = (
                <DisabledSidebarNavButton key={item.to} disabled collapsed={isNavCollapsed}>
                  <NavIconSlot>
                    <item.icon aria-hidden />
                  </NavIconSlot>
                  {!isNavCollapsed ? (
                    <Typography variant="body2">{navLabel(item)}</Typography>
                  ) : null}
                </DisabledSidebarNavButton>
              )

              if (isNavCollapsed) {
                return (
                  <Tooltip key={item.to} title={navLabel(item)} placement="right">
                    <span>{disabledButton}</span>
                  </Tooltip>
                )
              }

              return disabledButton
            }

            if (item.to === MODULES_ROUTE) {
              return (
                <SidebarModulesNav
                  key={item.to}
                  collapsed={isNavCollapsed}
                  disabled={false}
                  icon={item.icon}
                  label={navLabel(item)}
                />
              )
            }

            return (
              <SidebarNavLink
                key={item.to}
                to={item.to}
                label={navLabel(item)}
                icon={item.icon}
                end={item.end}
                collapsed={isNavCollapsed}
              />
            )
          })}
        </SidebarNavList>
        <SidebarFooter>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              px: isNavExpanded ? 0 : 0,
              alignItems: isNavExpanded ? 'stretch' : 'center',
            }}
          >
            {user?.name ? (
              isNavExpanded ? (
                <Tooltip title={user.name} placement="right" enterDelay={400}>
                  <SidebarUserRow expanded>
                    <SidebarUserAvatar aria-hidden>
                      {user.name.trim().charAt(0).toUpperCase()}
                    </SidebarUserAvatar>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      noWrap
                      sx={{ flex: 1, minWidth: 0 }}
                    >
                      {user.name}
                    </Typography>
                  </SidebarUserRow>
                </Tooltip>
              ) : (
                <Tooltip title={user.name} placement="right">
                  <SidebarUserRow expanded={false}>
                    <SidebarUserAvatar aria-hidden>
                      {user.name.trim().charAt(0).toUpperCase()}
                    </SidebarUserAvatar>
                  </SidebarUserRow>
                </Tooltip>
              )
            ) : null}
            {isNavExpanded ? (
              <LanguageSwitcher />
            ) : (
              <LanguageSwitcher iconOnly />
            )}
            {isNavExpanded ? (
              <SidebarLogoutButton
                type="button"
                variant="text"
                fullWidth
                onClick={() => void handleLogout()}
                startIcon={<StyledLogoutIcon aria-hidden />}
              >
                {t('common.signOut')}
              </SidebarLogoutButton>
            ) : (
              <Tooltip title={t('common.signOut')} placement="right">
                <NavToggleButton
                  size="small"
                  aria-label={t('common.signOut')}
                  onClick={() => void handleLogout()}
                >
                  <StyledLogoutIcon aria-hidden />
                </NavToggleButton>
              </Tooltip>
            )}
          </Box>
        </SidebarFooter>
      </Sidebar>

      <MainColumn>
        <MainContent wide={wideMainContent}>
          <BreadcrumbProvider>
            <MainInner wide={wideMainContent}>
              <Outlet />
            </MainInner>
          </BreadcrumbProvider>
        </MainContent>
      </MainColumn>
    </ShellRoot>
  )
}
