import { createTheme, alpha } from '@mui/material/styles'
import { colors } from './theme/colors'

export { cardSx, colors, inputFieldSx, mutedChipSx, toneChipSx } from './theme/colors'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.brand[500],
      light: colors.brand[400],
      dark: colors.brand[600],
      contrastText: colors.neutral[950],
    },
    secondary: {
      main: colors.neutral[500],
      light: colors.neutral[400],
      dark: colors.neutral[700],
    },
    success: {
      main: colors.success[500],
      light: colors.success[400],
      contrastText: colors.neutral[950],
    },
    error: {
      main: colors.error[500],
      dark: colors.error[600],
      contrastText: colors.neutral[950],
    },
    warning: {
      main: colors.warning[500],
      contrastText: colors.neutral[950],
    },
    info: {
      main: colors.info[500],
      light: colors.info[400],
      contrastText: colors.neutral[950],
    },
    background: {
      default: colors.neutral[950],
      paper: colors.neutral[850],
    },
    divider: alpha(colors.neutral[100], 0.08),
    text: {
      primary: alpha(colors.neutral[100], 0.92),
      secondary: alpha(colors.neutral[300], 0.78),
      disabled: alpha(colors.neutral[400], 0.5),
    },
    action: {
      hover: alpha(colors.neutral[100], 0.05),
      selected: alpha(colors.brand[500], 0.12),
      disabled: alpha(colors.neutral[100], 0.25),
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.neutral[950],
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${alpha(colors.neutral[100], 0.08)}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          '&.MuiButton-containedPrimary': {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
              backgroundColor: colors.brand[400],
            },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        selected: {
          backgroundColor: alpha(colors.brand[500], 0.12),
          color: colors.brand[400],
          '&:hover': {
            backgroundColor: alpha(colors.brand[500], 0.16),
          },
          '& .MuiTypography-root': {
            fontWeight: 600,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: colors.neutral[900],
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(colors.neutral[100], 0.16),
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.brand[500],
          },
        },
        notchedOutline: {
          borderColor: alpha(colors.neutral[100], 0.1),
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.neutral[850],
          border: `1px solid ${alpha(colors.neutral[100], 0.08)}`,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          border: `1px solid ${alpha(colors.neutral[100], 0.08)}`,
          '&.MuiAlert-standardSuccess': {
            backgroundColor: alpha(colors.success[500], 0.1),
            color: colors.success[400],
          },
          '&.MuiAlert-standardError': {
            backgroundColor: alpha(colors.error[500], 0.1),
            color: colors.error[500],
          },
          '&.MuiAlert-standardInfo': {
            backgroundColor: alpha(colors.info[500], 0.1),
            color: colors.info[400],
          },
          '&.MuiAlert-standardWarning': {
            backgroundColor: alpha(colors.warning[500], 0.1),
            color: colors.warning[500],
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: alpha(colors.neutral[100], 0.06),
        },
        head: {
          color: alpha(colors.neutral[300], 0.7),
          fontWeight: 600,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiAlert-root': {
            boxShadow: `0 8px 32px ${alpha(colors.neutral[950], 0.6)}`,
          },
        },
      },
    },
  },
})
