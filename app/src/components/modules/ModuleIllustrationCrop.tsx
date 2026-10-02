import Box from '@mui/material/Box'
import type { SxProps, Theme } from '@mui/material/styles'
import { ModuleIllustration } from '@/components/modules/ModuleIllustration'
import type { ModuleIconVariant, ModulePageId } from '@/lib/modules'

/** Matches ModuleIllustration viewBox aspect ratio (160×120). */
export const MODULE_ILLUSTRATION_ASPECT = 160 / 120

type ModuleIllustrationCropProps = {
  moduleId: ModulePageId
  variant?: ModuleIconVariant
  /** Placement and size of the illustration (full art fits inside). */
  viewportSx: SxProps<Theme>
  opacity?: number
}

export function ModuleIllustrationCrop({
  moduleId,
  variant,
  viewportSx,
  opacity = 0.88,
}: ModuleIllustrationCropProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...viewportSx,
      }}
      aria-hidden
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          opacity,
        }}
      >
        <ModuleIllustration moduleId={moduleId} variant={variant} />
      </Box>
    </Box>
  )
}
