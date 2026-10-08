import type { SxProps, Theme } from '@mui/material/styles'

/**
 * Vertical gap between major blocks on module list/session pages
 * (module header → session toolbar → main content).
 */
export const MODULE_PAGE_SECTION_SPACING = 2

/** Blocks that must not shrink when the viewport or flex workspace resizes. */
export const modulePageSectionChromeSx: SxProps<Theme> = {
  flexShrink: 0,
  flexGrow: 0,
  minWidth: 0,
}
