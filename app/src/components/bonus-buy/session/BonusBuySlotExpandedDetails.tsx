import { Grid, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { BonusBuySlot } from '@/api/bonus-buy'
import { formatBonusBuySlotStatus } from '@/api/bonus-buy'
import { formatDateTime } from '@/components/bonus-buy/session/bonus-buy-session-utils'

type BonusBuySlotExpandedDetailsProps = {
  slot: BonusBuySlot
}

const DetailLabel = styled(Typography)(({ theme }) => ({
  display: 'block',
  color: theme.palette.text.secondary,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  marginBottom: theme.spacing(0.5),
}))

export const BonusBuySlotExpandedDetails = ({
  slot,
}: BonusBuySlotExpandedDetailsProps) => {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <DetailLabel variant="caption">Username/Note</DetailLabel>
        <Typography variant="body2">{slot.providerName || '—'}</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <DetailLabel variant="caption">Status</DetailLabel>
        <Typography variant="body2">
          {formatBonusBuySlotStatus(slot.status)}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <DetailLabel variant="caption">Created by</DetailLabel>
        <Typography variant="body2">{slot.createdByName}</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <DetailLabel variant="caption">Created</DetailLabel>
        <Typography variant="body2">{formatDateTime(slot.createdAt)}</Typography>
      </Grid>
    </Grid>
  )
}
