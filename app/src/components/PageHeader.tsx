import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import type { SvgIconComponent } from '@mui/icons-material'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import DashboardIcon from '@mui/icons-material/Dashboard'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import GroupIcon from '@mui/icons-material/Group'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { IconTile } from '@/components/IconTile'
import { useBreadcrumbDynamicLabel } from '@/context/BreadcrumbContext'
import { getBreadcrumbAncestors } from '@/lib/breadcrumbs'
import type { ModuleIconVariant } from '@/lib/modules'
import { cardSx, colors } from '@/theme/colors'

const ICON_TILE_HEIGHT = 40

const breadcrumbIcons: Record<string, SvgIconComponent> = {
  Home: DashboardIcon,
  Team: GroupIcon,
  Widgets: SportsEsportsIcon,
  Subscription: CreditCardIcon,
  'Bonus Buy': CardGiftcardIcon,
}

type PageHeaderProps = {
  title: string
  description?: string
  icon?: SvgIconComponent
  iconVariant?: ModuleIconVariant
  action?: React.ReactNode
  showBreadcrumbs?: boolean
  className?: string
}

function PageHeaderBreadcrumbs() {
  const theme = useTheme()
  const { pathname } = useLocation()
  const { dynamicLabel } = useBreadcrumbDynamicLabel()
  const ancestors = getBreadcrumbAncestors(pathname, dynamicLabel)

  if (ancestors.length === 0) {
    return null
  }

  return (
    <Breadcrumbs
      aria-label="Breadcrumb"
      separator={
        <ChevronRightIcon
          sx={{ fontSize: 13, color: alpha(colors.neutral[400], 0.55) }}
          aria-hidden
        />
      }
      sx={{
        '& .MuiBreadcrumbs-ol': {
          flexWrap: 'nowrap',
        },
        '& .MuiBreadcrumbs-li': {
          display: 'flex',
          alignItems: 'center',
          minWidth: 0,
        },
        '& .MuiBreadcrumbs-separator': {
          mx: 0.375,
        },
      }}
    >
      {ancestors.map((item, index) => {
        const Icon = breadcrumbIcons[item.label]
        const isFirst = index === 0

        if (!item.to) {
          return (
            <Box
              key={`${item.label}-${index}`}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.625,
                px: 1,
                py: 0.375,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.text.primary, 0.04),
                border: '1px solid',
                borderColor: alpha(theme.palette.text.primary, 0.06),
              }}
            >
              {Icon ? <Icon sx={{ fontSize: 12, flexShrink: 0, opacity: 0.8 }} aria-hidden /> : null}
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.02em' }}
              >
                {item.label}
              </Typography>
            </Box>
          )
        }

        return (
          <Link
            key={`${item.label}-${index}`}
            component={RouterLink}
            to={item.to}
            underline="none"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.625,
              px: 1,
              py: 0.375,
              borderRadius: 1,
              color: isFirst ? 'text.secondary' : alpha(theme.palette.text.primary, 0.72),
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
              lineHeight: 1.4,
              bgcolor: alpha(theme.palette.text.primary, 0.03),
              border: '1px solid',
              borderColor: alpha(theme.palette.text.primary, 0.06),
              transition:
                'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease',
              '&:hover': {
                color: 'primary.light',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderColor: alpha(theme.palette.primary.main, 0.22),
                transform: 'translateY(-1px)',
              },
            }}
          >
            {Icon ? <Icon sx={{ fontSize: 12, flexShrink: 0 }} aria-hidden /> : null}
            {item.label}
          </Link>
        )
      })}
    </Breadcrumbs>
  )
}

export function PageHeader({
  title,
  description,
  icon,
  iconVariant = 'primary',
  action,
  showBreadcrumbs = true,
  className,
}: PageHeaderProps) {
  const theme = useTheme()
  const { pathname } = useLocation()
  const { dynamicLabel } = useBreadcrumbDynamicLabel()
  const hasBreadcrumbs =
    showBreadcrumbs && getBreadcrumbAncestors(pathname, dynamicLabel).length > 0

  return (
    <Box
      component="header"
      className={className}
      sx={{
        ...cardSx,
        overflow: 'hidden',
        backgroundImage: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 42%)`,
      }}
    >
      {hasBreadcrumbs ? (
        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: alpha(colors.neutral[100], 0.015),
            overflowX: 'auto',
          }}
        >
          <PageHeaderBreadcrumbs />
        </Box>
      ) : null}

      <Box
        sx={{
          display: 'flex',
          alignItems: description ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: 2,
          px: 2,
          py: hasBreadcrumbs ? 2 : 2.25,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            minWidth: 0,
            alignItems: description ? 'flex-start' : 'center',
            gap: 1.5,
          }}
        >
          {icon ? <IconTile icon={icon} variant={iconVariant} size="md" /> : null}
          <Box
            sx={{
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              ...(icon && !description
                ? {
                    height: ICON_TILE_HEIGHT,
                    overflow: 'hidden',
                  }
                : {}),
            }}
          >
            <Typography
              variant="subtitle1"
              component="h1"
              noWrap
              sx={{
                fontWeight: 700,
                fontSize: '1.0625rem',
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </Typography>
            {description ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                  display: 'block',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}
              >
                {description}
              </Typography>
            ) : null}
          </Box>
        </Box>
        {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
      </Box>
    </Box>
  )
}

type SectionHeaderProps = {
  title: string
  description?: string
  className?: string
}

export function SectionHeader({
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <Box
      component="header"
      className={className}
      sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
    >
      <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {description ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            lineHeight: 1.5,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {description}
        </Typography>
      ) : null}
    </Box>
  )
}
