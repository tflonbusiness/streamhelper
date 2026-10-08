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
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { IconTile } from '@/components/IconTile'
import { ModuleIllustrationCrop } from '@/components/modules/ModuleIllustrationCrop'
import { useBreadcrumbDynamicLabel } from '@/context/BreadcrumbContext'
import { getBreadcrumbAncestors } from '@/lib/breadcrumbs'
import {
  moduleHeaderBackground,
  modulePageHeaderSx,
} from '@/lib/module-page-chrome'
import type { ModuleIconVariant, ModulePageId } from '@/lib/modules'
import { cardSx, colors } from '@/theme/colors'

const ICON_TILE_HEIGHT = 40

const breadcrumbIcons: Record<string, SvgIconComponent> = {
  'nav.home': DashboardIcon,
  'nav.team': GroupIcon,
  'nav.widgets': SportsEsportsIcon,
  'nav.subscription': CreditCardIcon,
  'nav.bonusBuy': CardGiftcardIcon,
  'nav.prizeSpin': DashboardIcon,
  'nav.chatRoll': DashboardIcon,
}

type PageHeaderProps = {
  title: string
  description?: string
  icon?: SvgIconComponent
  iconVariant?: ModuleIconVariant
  moduleSurface?: boolean
  moduleId?: ModulePageId
  action?: React.ReactNode
  showBreadcrumbs?: boolean
  /** When true, breadcrumb row is omitted (e.g. rendered by session chrome). */
  omitBreadcrumbBar?: boolean
  className?: string
}

export function PageHeaderBreadcrumbs() {
  const theme = useTheme()
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { dynamicLabel } = useBreadcrumbDynamicLabel()
  const ancestors = getBreadcrumbAncestors(pathname, t, dynamicLabel)

  if (ancestors.length === 0) {
    return null
  }

  return (
    <Breadcrumbs
      aria-label={t('common.breadcrumb')}
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
        const iconKey = item.labelKey ?? ''
        const Icon = breadcrumbIcons[iconKey]
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
  moduleSurface = false,
  moduleId,
  action,
  showBreadcrumbs = true,
  omitBreadcrumbBar = false,
  className,
}: PageHeaderProps) {
  const theme = useTheme()
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { dynamicLabel } = useBreadcrumbDynamicLabel()
  const hasBreadcrumbs =
    !omitBreadcrumbBar &&
    showBreadcrumbs &&
    getBreadcrumbAncestors(pathname, t, dynamicLabel).length > 0
  const moduleHeaderSx =
    moduleSurface && icon ? modulePageHeaderSx(iconVariant, theme) : undefined
  const showModuleIllustration = moduleSurface && moduleId

  return (
    <Box
      component="header"
      className={className}
      sx={{
        ...cardSx,
        position: 'relative',
        overflow: 'hidden',
        ...(moduleHeaderSx as object | undefined),
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: moduleHeaderBackground(
            iconVariant,
            theme,
            moduleSurface,
            Boolean(icon),
          ),
          pointerEvents: 'none',
        },
      }}
    >
      {hasBreadcrumbs ? (
        <Box
          sx={{
            position: 'relative',
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
          position: 'relative',
          display: 'flex',
          alignItems: description ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: 2,
          px: 2,
          py: hasBreadcrumbs ? 2 : 2.25,
          pr: showModuleIllustration ? { sm: 20, md: 24 } : 2,
        }}
      >
        {showModuleIllustration ? (
          <ModuleIllustrationCrop
            moduleId={moduleId}
            variant={iconVariant}
            viewportSx={{
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: { sm: 128, md: 160 },
              height: { sm: 96, md: 120 },
              display: { xs: 'none', sm: 'flex' },
              zIndex: 0,
            }}
          />
        ) : null}
        <Box
          sx={{
            display: 'flex',
            minWidth: 0,
            alignItems: description ? 'flex-start' : 'center',
            gap: 1.5,
            flex: 1,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {icon ? (
            <IconTile icon={icon} variant={iconVariant} size={moduleSurface ? 'lg' : 'md'} />
          ) : null}
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
        {action ? (
          <Box sx={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>{action}</Box>
        ) : null}
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
