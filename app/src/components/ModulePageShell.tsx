import Stack from '@mui/material/Stack'
import { alpha, useTheme } from '@mui/material/styles'
import { moduleAccentForModuleId } from '@/lib/module-accent-color'
import type { ModulePageId } from '@/lib/modules'

type ModulePageShellProps = {
  moduleId: ModulePageId
  children: React.ReactNode
  spacing?: number
}

/** Ambient module tint behind list/session pages. */
export function ModulePageShell({
  moduleId,
  children,
  spacing = 4,
}: ModulePageShellProps) {
  const theme = useTheme()
  const accent = moduleAccentForModuleId(moduleId, theme)

  return (
    <Stack
      spacing={spacing}
      sx={{
        position: 'relative',
        isolation: 'isolate',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '-16px -12px auto -12px',
          height: 220,
          borderRadius: 4,
          background: `radial-gradient(115% 100% at 8% 0%, ${alpha(accent, 0.18)} 0%, transparent 65%)`,
          pointerEvents: 'none',
          zIndex: 0,
        },
        '& > *': {
          position: 'relative',
          zIndex: 1,
        },
      }}
    >
      {children}
    </Stack>
  )
}
