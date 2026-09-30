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
import LogoutIcon from '@mui/icons-material/Logout'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import { alpha, styled } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { AppLogo } from '@/components/AppLogo'
import { AppBrandName, appBrandNamePlain } from '@/components/AppBrandName'
import { BreadcrumbProvider } from '@/context/BreadcrumbContext'
import { useAuth } from '@/context/AuthContext'
import { colors } from '@/theme/colors'

const NAV_EXPANDED_STORAGE_KEY = 'caz-service-shell-nav-visible'

const SIDEBAR_WIDTH_EXPANDED = 224
const SIDEBAR_WIDTH_COLLAPSED = 64

const SERVICE_HOME = '/service/subscriptions'

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
  gap: theme.spacing(1),
  padding: theme.spacing(1.5, 2),
}))

const MobileBrandLockup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.25),
  minWidth: 0,
  flex: 1,
}))

const MobileLogoutButton = styled(Button)({
  minWidth: 0,
  paddingLeft: 8,
  paddingRight: 8,
})

const StyledLogoutIcon = styled(LogoutIcon)({
  fontSize: 16,
})

const StyledSwapHorizIcon = styled(SwapHorizIcon)({
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

const BrandHomeLink = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: 'inherit',
  display: 'inline-flex',
  flexShrink: 0,
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  '&:focus-visible': {
    outline: `2px solid ${alpha(colors.brand[500], 0.85)}`,
    outlineOffset: 2,
  },
}))

const MobileRouterLink = styled(NavLink)({
  textDecoration: 'none',
  color: 'inherit',
  minWidth: 0,
  flex: 1,
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

const MobileNavButton = styled(ListItemButton)(({ theme }) => ({
  flex: 1,
  borderRadius: theme.shape.borderRadius,
  gap: theme.spacing(0.75),
  padding: theme.spacing(0.75, 1),
  justifyContent: 'center',
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.text.primary,
  },
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
  padding: expanded ? theme.spacing(2) : theme.spacing(2, 1),
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

const SidebarBrandLockup = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded?: boolean }>(({ theme, expanded }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.25),
  minWidth: 0,
  flex: expanded ? 1 : undefined,
  justifyContent: expanded ? 'flex-start' : 'center',
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

const SidebarFooterButton = styled(Button)(({ theme }) => ({
  justifyContent: 'flex-start',
  textTransform: 'none',
  whiteSpace: 'nowrap',
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
}))

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
    return (
      <Tooltip title={label} placement="right">
        {link}
      </Tooltip>
    )
  }

  return link
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

export function ServiceShell() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isNavExpanded, setIsNavExpanded] = useState(loadNavExpanded)

  const subscriptionsLabel = t('servicePortal.navSubscriptions')

  useEffect(() => {
    localStorage.setItem(NAV_EXPANDED_STORAGE_KEY, String(isNavExpanded))
  }, [isNavExpanded])

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

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
          <MobileBrandLockup>
            <BrandHomeLink to={SERVICE_HOME} end aria-label={subscriptionsLabel}>
              <AppLogo alt={appBrandNamePlain(t)} size="sidebar" />
            </BrandHomeLink>
            <AppBrandName size="sidebar" />
          </MobileBrandLockup>
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
        <MobileNavLink
          to={SERVICE_HOME}
          label={subscriptionsLabel}
          icon={CreditCardIcon}
          end
        />
      </MobileNav>

      <Sidebar expanded={isNavExpanded}>
        <SidebarHeaderRow expanded={isNavExpanded}>
          <SidebarBrandLockup expanded={isNavExpanded}>
            <BrandHomeLink to={SERVICE_HOME} end aria-label={subscriptionsLabel}>
              <AppLogo
                alt={appBrandNamePlain(t)}
                size={isNavExpanded ? 'sidebar' : 'sidebarCompact'}
              />
            </BrandHomeLink>
            {isNavExpanded ? <AppBrandName size="sidebar" /> : null}
          </SidebarBrandLockup>
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
          <SidebarNavLink
            to={SERVICE_HOME}
            label={subscriptionsLabel}
            icon={CreditCardIcon}
            end
            collapsed={isNavCollapsed}
          />
        </SidebarNavList>

        <SidebarFooter>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
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
                      noWrap
                      sx={{ flex: 1, minWidth: 0, fontWeight: 600 }}
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.25,
                alignItems: isNavExpanded ? 'stretch' : 'center',
              }}
            >
              {isNavExpanded ? (
                <SidebarFooterButton
                  type="button"
                  variant="text"
                  fullWidth
                  onClick={() => navigate('/continue')}
                  startIcon={<StyledSwapHorizIcon aria-hidden />}
                >
                  {t('continueWorkspace.switchMode')}
                </SidebarFooterButton>
              ) : (
                <Tooltip title={t('continueWorkspace.switchMode')} placement="right">
                  <NavToggleButton
                    size="small"
                    aria-label={t('continueWorkspace.switchMode')}
                    onClick={() => navigate('/continue')}
                  >
                    <StyledSwapHorizIcon aria-hidden />
                  </NavToggleButton>
                </Tooltip>
              )}
              {isNavExpanded ? (
                <SidebarFooterButton
                  type="button"
                  variant="text"
                  fullWidth
                  onClick={() => void handleLogout()}
                  startIcon={<StyledLogoutIcon aria-hidden />}
                >
                  {t('common.signOut')}
                </SidebarFooterButton>
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
          </Box>
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
