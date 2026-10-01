import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { cardSx } from '@/theme/colors'

type DashboardSectionProps = {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  /** Panel wraps content in a bordered surface; plain is header + content only. */
  variant?: 'plain' | 'panel'
  /** With `panel`, render title/description inside the bordered surface. */
  headerInPanel?: boolean
}

export function DashboardSection({
  title,
  description,
  action,
  children,
  variant = 'plain',
  headerInPanel = false,
}: DashboardSectionProps) {
  const showHeader = Boolean(title || description || action)

  const header = showHeader ? (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      alignItems={{ sm: 'center' }}
      justifyContent="space-between"
      sx={headerInPanel ? { mb: 2 } : undefined}
    >
      <Box sx={{ minWidth: 0 }}>
        {title ? (
          <Typography
            variant="h6"
            component="h2"
            sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}
          >
            {title}
          </Typography>
        ) : null}
        {description ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: title ? 0.5 : 0, lineHeight: 1.5, maxWidth: 520 }}
          >
            {description}
          </Typography>
        ) : null}
      </Box>
      {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
    </Stack>
  ) : null

  const headerOutside = showHeader && !headerInPanel ? header : null
  const headerInside = showHeader && headerInPanel ? header : null

  return (
    <Box
      component="section"
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      {headerOutside}

      {variant === 'panel' ? (
        <Box sx={{ ...cardSx, p: { xs: 2, sm: 2.5 } }}>
          {headerInside}
          {children}
        </Box>
      ) : (
        children
      )}
    </Box>
  )
}
