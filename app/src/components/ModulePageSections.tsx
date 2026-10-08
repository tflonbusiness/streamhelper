import Box from '@mui/material/Box'
import Stack, { type StackProps } from '@mui/material/Stack'
import type { SxProps, Theme } from '@mui/material/styles'
import {
  MODULE_PAGE_SECTION_SPACING,
  modulePageSectionChromeSx,
} from '@/lib/module-page-layout'

type ModulePageSectionsProps = StackProps

/** Stacks module page blocks with consistent vertical rhythm. */
export function ModulePageSections({
  spacing = MODULE_PAGE_SECTION_SPACING,
  ...props
}: ModulePageSectionsProps) {
  return <Stack spacing={spacing} {...props} />
}

type ModulePageSectionChromeProps = {
  children: React.ReactNode
  sx?: SxProps<Theme>
}

/** Wrapper for headers/toolbars that should keep their natural height in flex layouts. */
export function ModulePageSectionChrome({
  children,
  sx,
}: ModulePageSectionChromeProps) {
  return <Box sx={{ ...modulePageSectionChromeSx, ...sx }}>{children}</Box>
}
