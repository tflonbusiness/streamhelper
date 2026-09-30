import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { AppLogo } from '@/components/AppLogo'
import { AppBrandName } from '@/components/AppBrandName'

type BrandHeaderProps = {
  title?: string
  description?: string
  compact?: boolean
  horizontal?: boolean
  className?: string
}

export function BrandHeader({
  title,
  description,
  compact = false,
  horizontal = false,
  className,
}: BrandHeaderProps) {
  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexDirection: horizontal ? 'row' : 'column',
        alignItems: horizontal ? 'center' : 'center',
        gap: 1.5,
        textAlign: horizontal ? 'left' : 'center',
      }}
    >
      <AppLogo alt="StreamHelper" size={compact ? 'sidebar' : 'md'} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {title ? (
          <Typography variant={compact ? 'h6' : 'h5'} component="h1">
            {title}
          </Typography>
        ) : (
          <AppBrandName
            size={compact ? 'sidebar' : 'md'}
            component="h1"
          />
        )}
        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Box>
    </Box>
  )
}
