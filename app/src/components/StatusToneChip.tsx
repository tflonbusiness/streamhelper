import Chip from '@mui/material/Chip'
import type { SxProps, Theme } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'
import type { ReactElement } from 'react'
import { colors, mutedChipSx, toneChipSx } from '@/theme/colors'

export const statusBadgeColors = {
  live: colors.live[500],
  open: colors.info[500],
  paused: colors.warning[500],
  playing: colors.live[500],
} as const

export function statusToneChipSx(
  color: string,
  withIcon = false,
): SxProps<Theme> {
  return {
    ...toneChipSx(color),
    height: 24,
    flexShrink: 0,
    '& .MuiChip-icon': withIcon
      ? {
          color,
          ml: 1,
          mr: -0.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
        }
      : undefined,
    '& .MuiChip-label': {
      pl: withIcon ? 0.5 : 0.75,
      pr: 1.25,
      py: 0,
      display: 'flex',
      alignItems: 'center',
    },
  }
}

type StatusToneChipProps = {
  label: string
  color: string
  icon?: ReactElement
}

export function StatusToneChip({ label, color, icon }: StatusToneChipProps) {
  return (
    <Chip
      icon={icon}
      label={label}
      size="small"
      sx={statusToneChipSx(color, Boolean(icon))}
    />
  )
}

export function MutedStatusChip({ label }: { label: string }) {
  const theme = useTheme()

  return <Chip label={label} size="small" sx={mutedChipSx(theme)} />
}
