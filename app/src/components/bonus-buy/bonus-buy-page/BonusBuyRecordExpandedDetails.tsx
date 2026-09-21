import { Grid, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { BonusBuyRecord } from '@/api/bonus-buy'
import { formatBonusBuyDateTime } from '@/components/bonus-buy/bonus-buy-page/bonus-buy-page-utils'

type BonusBuyRecordExpandedDetailsProps = {
  record: BonusBuyRecord
}

const DetailLabel = styled(Typography)(({ theme }) => ({
  display: 'block',
  color: theme.palette.text.secondary,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  marginBottom: theme.spacing(0.5),
}))

export const BonusBuyRecordExpandedDetails = ({
  record,
}: BonusBuyRecordExpandedDetailsProps) => {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <DetailLabel variant="caption">Created by</DetailLabel>
        <Typography variant="body2">{record.createdByName}</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <DetailLabel variant="caption">Created</DetailLabel>
        <Typography variant="body2">
          {formatBonusBuyDateTime(record.createdAt)}
        </Typography>
      </Grid>
    </Grid>
  )
}
