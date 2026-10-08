import type { SvgIconComponent } from '@mui/icons-material'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { IconTile } from '@/components/IconTile'
import { moduleSessionPageTitle } from '@/components/ModuleSessionPageHeader'
import { PageHeaderBreadcrumbs } from '@/components/PageHeader'
import {
  moduleHeaderBackground,
  modulePageHeaderSx,
} from '@/lib/module-page-chrome'
import type { ModuleDefinition, ModuleIconVariant } from '@/lib/modules'
import { cardSx, colors } from '@/theme/colors'

type SessionPageBreadcrumbBarProps = {
  module: ModuleDefinition
}

/** Session pages: module accent and breadcrumbs only (no module title/description block). */
export function SessionPageBreadcrumbBar({ module }: SessionPageBreadcrumbBarProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const iconVariant = module.iconVariant as ModuleIconVariant
  const moduleHeaderSx = modulePageHeaderSx(iconVariant, theme)
  const moduleTitle = moduleSessionPageTitle(module, t)
  const ModuleIcon = module.icon as SvgIconComponent

  return (
    <Box
      component="header"
      sx={{
        ...cardSx,
        position: 'relative',
        overflow: 'hidden',
        ...(moduleHeaderSx as object),
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: moduleHeaderBackground(iconVariant, theme, true, true),
          pointerEvents: 'none',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: 40,
          px: 2,
          py: 1,
          bgcolor: alpha(colors.neutral[100], 0.015),
        }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            overflowX: 'auto',
            display: 'flex',
            alignItems: 'center',
            alignSelf: 'stretch',
            '& .MuiBreadcrumbs-root': {
              margin: 0,
              lineHeight: 1,
            },
            '& .MuiBreadcrumbs-ol': {
              alignItems: 'center',
              flexWrap: 'nowrap',
            },
            '& .MuiBreadcrumbs-li': {
              display: 'flex',
              alignItems: 'center',
            },
          }}
        >
          <PageHeaderBreadcrumbs />
        </Box>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            flexShrink: 0,
            minWidth: 0,
            alignSelf: 'center',
            height: 32,
          }}
        >
          <Typography
            variant="caption"
            noWrap
            component="span"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 700,
              fontSize: '0.75rem',
              lineHeight: 1,
              letterSpacing: '-0.01em',
              maxWidth: { xs: 100, sm: 180 },
            }}
          >
            {moduleTitle}
          </Typography>
          <IconTile icon={ModuleIcon} variant={iconVariant} size="sm" />
        </Stack>
      </Box>
    </Box>
  )
}
