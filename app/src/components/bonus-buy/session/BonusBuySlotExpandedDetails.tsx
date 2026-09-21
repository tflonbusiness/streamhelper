import { Grid, Typography } from '@mui/material'
import type { BonusBuySlot } from '@/api/bonus-buy'
import { formatBonusBuySlotStatus } from '@/api/bonus-buy'
import { formatDateTime } from '@/components/bonus-buy/session/bonus-buy-session-utils'

type BonusBuySlotExpandedDetailsProps = {
  slot: BonusBuySlot
}

const captionSx = {
  display: 'block',
  color: 'text.secondary',
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  mb: 0.5,
} as const

export const BonusBuySlotExpandedDetails = (
  props: BonusBuySlotExpandedDetailsProps,
) => {
  const { slot } = props

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Typography variant="caption" sx={captionSx}>
          Provider Name
        </Typography>
        <Typography variant="body2">{slot.providerName || '—'}</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Typography variant="caption" sx={captionSx}>
          Status
        </Typography>
        <Typography variant="body2">
          {formatBonusBuySlotStatus(slot.status)}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Typography variant="caption" sx={captionSx}>
          Created by
        </Typography>
        <Typography variant="body2">{slot.createdByName}</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Typography variant="caption" sx={captionSx}>
          Created
        </Typography>
        <Typography variant="body2">{formatDateTime(slot.createdAt)}</Typography>
      </Grid>
    </Grid>
  )
}
