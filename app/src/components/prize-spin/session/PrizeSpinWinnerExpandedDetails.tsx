import { Grid, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { PrizeSpinWin } from '@/api/prize-spin'
import { formatPrizeSpinDateTime } from '@/components/prize-spin/prize-spin-utils'

type PrizeSpinWinnerExpandedDetailsProps = {
  win: PrizeSpinWin
}

const DetailLabel = styled(Typography)(({ theme }) => ({
  display: 'block',
  color: theme.palette.text.secondary,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  marginBottom: theme.spacing(0.5),
}))

export const PrizeSpinWinnerExpandedDetails = (
  props: PrizeSpinWinnerExpandedDetailsProps,
) => {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailLabel variant="caption">Time</DetailLabel>
        <Typography variant="body2">
          {formatPrizeSpinDateTime(props.win.createdAt)}
        </Typography>
      </Grid>
    </Grid>
  )
}
