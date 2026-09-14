import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import type { LucideIcon } from 'lucide-react'
import { IconTile } from '@/components/IconTile'

type StatCardProps = {
  value: string
  label: string
  subtext?: string
  icon: LucideIcon
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'muted'
  highlight?: boolean
  className?: string
}

export function StatCard({
  value,
  label,
  subtext,
  icon,
  variant = 'muted',
  highlight = false,
  className,
}: StatCardProps) {
  const theme = useTheme()

  return (
    <Card
      className={className}
      sx={{
        overflow: 'hidden',
        transition: 'background-color 0.2s, border-color 0.2s',
        ...(highlight && {
          borderColor: alpha(theme.palette.success.main, 0.35),
          bgcolor: alpha(theme.palette.success.main, 0.06),
        }),
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: subtext ? 1 : 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <IconTile icon={icon} variant={variant} size="sm" />
          {highlight ? (
            <Box sx={{ position: 'relative', display: 'flex', width: 10, height: 10 }}>
              <Box
                sx={{
                  position: 'absolute',
                  display: 'inline-flex',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  bgcolor: theme.palette.success.light,
                  opacity: 0.6,
                  animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                  '@keyframes ping': {
                    '75%, 100%': { transform: 'scale(2)', opacity: 0 },
                  },
                }}
              />
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: theme.palette.success.light,
                }}
              />
            </Box>
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="h4" component="p" sx={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </CardContent>
      {subtext ? (
        <CardContent sx={{ pt: 0, pb: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {subtext}
          </Typography>
        </CardContent>
      ) : null}
    </Card>
  )
}
