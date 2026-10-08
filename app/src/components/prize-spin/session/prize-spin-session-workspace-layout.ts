import type { SxProps, Theme } from '@mui/material/styles'

export function prizeSpinSessionPageShellSx(_theme: Theme): SxProps<Theme> {
  return {}
}

export function prizeSpinSessionWorkspaceGridSx(_theme: Theme): SxProps<Theme> {
  return {
    alignItems: 'stretch',
    width: '100%',
  }
}

export function prizeSpinSessionWorkspaceColumnSx(_theme: Theme): SxProps<Theme> {
  return {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  }
}

export function prizeSpinSessionSectorsColumnSx(theme: Theme): SxProps<Theme> {
  return {
    ...prizeSpinSessionWorkspaceColumnSx(theme),
    [theme.breakpoints.up('lg')]: {
      alignSelf: 'stretch',
      minHeight: 0,
    },
  }
}
