import Stack from '@mui/material/Stack'
import type { ModulePageId } from '@/lib/modules'

type ModulePageShellProps = {
  moduleId: ModulePageId
  children: React.ReactNode
  spacing?: number
}

/** Vertical layout wrapper for module list/session pages. */
export function ModulePageShell({
  moduleId: _moduleId,
  children,
  spacing = 4,
}: ModulePageShellProps) {
  return <Stack spacing={spacing}>{children}</Stack>
}
