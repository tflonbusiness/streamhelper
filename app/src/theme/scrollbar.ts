import { alpha, type Theme } from '@mui/material/styles'
import { colors } from './colors'

function scrollbarColors() {
  const thumb = alpha(colors.neutral[400], 0.32)
  const thumbHover = alpha(colors.neutral[300], 0.5)
  const thumbActive = alpha(colors.brand[500], 0.45)
  const track = 'transparent'

  return { thumb, thumbHover, thumbActive, track }
}

/** Scrollbar chrome for a single scrollable element (styled / sx). */
export function appScrollbarStyles(theme: Theme) {
  const { thumb, thumbHover, thumbActive, track } = scrollbarColors()

  return {
    scrollbarWidth: 'thin',
    scrollbarColor: `${thumb} ${track}`,
    '&::-webkit-scrollbar': {
      width: 8,
      height: 8,
    },
    '&::-webkit-scrollbar-track': {
      background: track,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: thumb,
      borderRadius: theme.shape.borderRadius,
      border: '2px solid transparent',
      backgroundClip: 'padding-box',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: thumbHover,
    },
    '&::-webkit-scrollbar-thumb:active': {
      backgroundColor: thumbActive,
    },
    '&::-webkit-scrollbar-corner': {
      background: track,
    },
  }
}

/** Global scrollbar styling via CssBaseline. */
export function appScrollbarGlobalStyles(theme: Theme) {
  const { thumb, thumbHover, thumbActive, track } = scrollbarColors()
  const radius = theme.shape.borderRadius

  return {
    '*': {
      scrollbarWidth: 'thin',
      scrollbarColor: `${thumb} ${track}`,
    },
    '*::-webkit-scrollbar': {
      width: 8,
      height: 8,
    },
    '*::-webkit-scrollbar-track': {
      background: track,
    },
    '*::-webkit-scrollbar-thumb': {
      backgroundColor: thumb,
      borderRadius: radius,
      border: '2px solid transparent',
      backgroundClip: 'padding-box',
    },
    '*::-webkit-scrollbar-thumb:hover': {
      backgroundColor: thumbHover,
    },
    '*::-webkit-scrollbar-thumb:active': {
      backgroundColor: thumbActive,
    },
    '*::-webkit-scrollbar-corner': {
      background: track,
    },
  }
}
