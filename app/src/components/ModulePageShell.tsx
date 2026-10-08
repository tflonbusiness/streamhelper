import Stack from '@mui/material/Stack'
import type { SxProps, Theme } from '@mui/material/styles'
import { MODULE_PAGE_SECTION_SPACING } from '@/lib/module-page-layout'
import type { ModulePageId } from '@/lib/modules'

type ModulePageShellProps = {
  moduleId: ModulePageId
  children: React.ReactNode
  spacing?: number
  sx?: SxProps<Theme>
}

/** Vertical layout wrapper for module list/session pages. */
export function ModulePageShell({
  moduleId: _moduleId,
  children,
  spacing = MODULE_PAGE_SECTION_SPACING,
  sx,
}: ModulePageShellProps) {
  return (
    <Stack spacing={spacing} sx={sx}>
      {children}
    </Stack>
  )
}
