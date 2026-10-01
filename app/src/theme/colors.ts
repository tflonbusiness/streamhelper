import { alpha, type SxProps, type Theme } from '@mui/material/styles'

export const colors = {
  neutral: {
    950: '#0B0B0F',
    900: '#121218',
    850: '#18181F',
    800: '#1F1F28',
    700: '#2A2A35',
    500: '#6E6E7A',
    400: '#9898A4',
    300: '#B8B8C2',
    100: '#EDEDF0',
  },
  brand: {
    600: '#D48908',
    500: '#F0A020',
    400: '#F7BC4F',
  },
  success: {
    500: '#3ECF8E',
    400: '#6EE7B7',
  },
  error: {
    500: '#F87171',
    600: '#EF4444',
  },
  warning: {
    500: '#FBBF24',
  },
  info: {
    500: '#56B4F8',
    400: '#7DD3FC',
  },
  purple: {
    500: '#A78BFA',
    400: '#C4B5FD',
  },
} as const

export const cardSx: SxProps<Theme> = {
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
}

export const inputFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'background.default',
  },
}

/** Native date/time picker icon visibility on dark backgrounds (WebKit). */
export const datetimeLocalFieldSx: SxProps<Theme> = {
  ...inputFieldSx,
  '& .MuiOutlinedInput-input[type="datetime-local"]': {
    colorScheme: 'dark',
    paddingRight: 4,
  },
  '& .MuiOutlinedInput-input[type="datetime-local"]::-webkit-calendar-picker-indicator': {
    cursor: 'pointer',
    filter: 'invert(0.92)',
    opacity: 0.92,
  },
}

export function toneChipSx(color: string): SxProps<Theme> {
  return {
    height: 24,
    fontSize: '0.75rem',
    fontWeight: 500,
    bgcolor: alpha(color, 0.12),
    color,
    border: '1px solid',
    borderColor: alpha(color, 0.24),
  }
}

export function mutedChipSx(theme: Theme): SxProps<Theme> {
  return {
    height: 24,
    fontSize: '0.75rem',
    fontWeight: 500,
    bgcolor: alpha(theme.palette.text.primary, 0.06),
    color: theme.palette.text.secondary,
    border: '1px solid',
    borderColor: alpha(theme.palette.text.primary, 0.1),
  }
}
