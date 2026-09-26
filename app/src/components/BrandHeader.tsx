import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

type BrandHeaderProps = {
  title?: string
  description?: string
  compact?: boolean
  horizontal?: boolean
  className?: string
}

export function BrandHeader({
  title = 'Stream Helper',
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
      <Box
        component="img"
        src="/logo.svg"
        alt="Stream Helper"
        sx={{
          flexShrink: 0,
          width: compact ? 32 : 48,
          height: compact ? 32 : 48,
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Typography variant={compact ? 'h6' : 'h5'} component="h1">
          {title}
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Box>
    </Box>
  )
}
