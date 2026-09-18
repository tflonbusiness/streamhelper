import { Grid, Typography } from '@mui/material'
import type { PrizeSpinRecord } from '@/api/prize-spin'
import { formatPrizeSpinDateTime } from '@/components/prize-spin/prize-spin-page-utils'

type PrizeSpinRecordExpandedDetailsProps = {
  record: PrizeSpinRecord
}

export function PrizeSpinRecordExpandedDetails({
  record,
}: PrizeSpinRecordExpandedDetailsProps) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: 'text.secondary',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            mb: 0.5,
          }}
        >
          Created by
        </Typography>
        <Typography variant="body2">{record.createdByName}</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: 'text.secondary',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            mb: 0.5,
          }}
        >
          Created
        </Typography>
        <Typography variant="body2">
          {formatPrizeSpinDateTime(record.createdAt)}
        </Typography>
      </Grid>
    </Grid>
  )
}
