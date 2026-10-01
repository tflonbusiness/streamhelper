import type { SxProps, Theme } from '@mui/material/styles'

export const entitlementAlertSx: SxProps<Theme> = {
  py: 0,
  px: 0,
  border: 'none',
  backgroundColor: 'transparent',
  alignItems: 'center',
  '& .MuiAlert-icon': {
    padding: 0,
    marginRight: 1.25,
    alignSelf: 'center',
  },
  '& .MuiAlert-message': {
    py: 0,
    overflow: 'visible',
    alignSelf: 'center',
  },
  '& .MuiAlertTitle-root': {
    fontSize: '0.875rem',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    mb: 0.25,
    mt: 0,
    color: 'text.primary',
  },
}
