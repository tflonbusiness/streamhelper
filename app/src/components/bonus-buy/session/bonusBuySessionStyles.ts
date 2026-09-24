import { CardContent } from '@mui/material'
import { alpha, type Theme } from '@mui/material/styles'
import { styled } from '@mui/material/styles'

export const StyledSessionStatCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}))

export function playingSlotRowSx(theme: Theme) {
  return {
    bgcolor: alpha(theme.palette.warning.main, 0.08),
    boxShadow: `inset 0 0 0 2px ${alpha(theme.palette.warning.main, 0.55)}`,
    '&:hover': {
      bgcolor: alpha(theme.palette.warning.main, 0.12),
    },
  }
}

export function slotActionIconButtonSx(
  palette: 'primary' | 'success' | 'warning' | 'info' | 'error',
  theme: Theme,
) {
  const color =
    palette === 'primary'
      ? theme.palette.primary
      : palette === 'success'
        ? theme.palette.success
        : palette === 'warning'
          ? theme.palette.warning
          : palette === 'info'
            ? theme.palette.info
            : theme.palette.error

  return {
    borderRadius: 1,
    width: 28,
    height: 28,
    bgcolor:
      palette === 'error'
        ? alpha(color.main, 0.12)
        : color.main,
    color:
      palette === 'error'
        ? color.main
        : color.contrastText,
    '&:hover': {
      bgcolor:
        palette === 'error'
          ? alpha(color.main, 0.2)
          : color.dark,
    },
  }
}
