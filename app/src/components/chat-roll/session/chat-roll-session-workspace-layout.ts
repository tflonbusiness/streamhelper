import type { SxProps, Theme } from '@mui/material/styles'
import { modulePageSectionChromeSx } from '@/lib/module-page-layout'

/** Minimum height of the session workspace row (settings / chat / lists) on large layouts. */
export const CHAT_ROLL_SESSION_WORKSPACE_MIN_HEIGHT_PX = 480

/** Matches wide `MainContent` vertical padding (spacing 2 top + bottom). */
function mainContentVerticalInset(theme: Theme) {
  const pad = theme.spacing(2)
  return `calc(100dvh - ${pad} - ${pad})`
}

/** Page shell: headers keep natural height; workspace fills the rest of the viewport. */
export function chatRollSessionPageShellSx(theme: Theme): SxProps<Theme> {
  return {
    [theme.breakpoints.up('lg')]: {
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      minHeight: mainContentVerticalInset(theme),
    },
  }
}

/** @deprecated Use `modulePageSectionChromeSx` from `@/lib/module-page-layout`. */
export const chatRollSessionPageChromeSx = modulePageSectionChromeSx

export function chatRollSessionWorkspaceGridSx(theme: Theme): SxProps<Theme> {
  return {
    alignItems: 'stretch',
    width: '100%',
    [theme.breakpoints.up('lg')]: {
      flex: '1 1 0',
      minHeight: CHAT_ROLL_SESSION_WORKSPACE_MIN_HEIGHT_PX,
      minWidth: 0,
      gridTemplateRows: 'minmax(0, 1fr)',
    },
  }
}

export function chatRollSessionWorkspaceColumnSx(theme: Theme): SxProps<Theme> {
  return {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
    [theme.breakpoints.up('lg')]: {
      alignSelf: 'stretch',
      height: '100%',
    },
  }
}

/** Session workspace cards (settings, chat, lists) fill the column height. */
export const chatRollSessionWorkspaceCardSx: SxProps<Theme> = {
  flex: '1 1 auto',
  minHeight: 0,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
}
