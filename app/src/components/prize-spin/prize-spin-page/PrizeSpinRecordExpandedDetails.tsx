import { Grid, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { PrizeSpinRecord } from '@/api/prize-spin'
import { formatPrizeSpinDateTime } from '@/components/prize-spin/prize-spin-utils'

type PrizeSpinRecordExpandedDetailsProps = {
  record: PrizeSpinRecord
}

const DetailLabel = styled(Typography)(({ theme }) => ({
  display: 'block',
  color: theme.palette.text.secondary,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  marginBottom: theme.spacing(0.5),
}))

export const PrizeSpinRecordExpandedDetails = ({
  record,
}: PrizeSpinRecordExpandedDetailsProps) => {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <DetailLabel variant="caption">Created by</DetailLabel>
        <Typography variant="body2">{record.createdByName}</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <DetailLabel variant="caption">Created</DetailLabel>
        <Typography variant="body2">
          {formatPrizeSpinDateTime(record.createdAt)}
        </Typography>
      </Grid>
    </Grid>
  )
}
