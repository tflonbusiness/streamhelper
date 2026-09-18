import Box from '@mui/material/Box'
import { DotField } from '@/components/backgrounds/DotField'
import { colors } from '@/theme/colors'

export function DotFieldBackground() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <DotField
        dotRadius={2}
        dotSpacing={14}
        bulgeStrength={67}
        glowRadius={160}
        sparkle={false}
        waveAmplitude={0}
        gradientFrom="rgba(167, 139, 250, 0.8)"
        gradientTo="rgba(196, 181, 253, 0.7)"
        glowColor={colors.neutral[950]}
      />
    </Box>
  )
}
