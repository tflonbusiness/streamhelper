import { Grid, Skeleton, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { PageHeader } from '@/components/PageHeader'
import { bonusBuyModule } from '@/components/bonus-buy/session/bonus-buy-session-utils'

const PageStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(4),
}))

export const BonusBuySessionLoadingState = () => {
  return (
    <PageStack>
      <PageHeader
        title={bonusBuyModule.name}
        description={bonusBuyModule.description}
        icon={bonusBuyModule.icon}
        iconVariant={bonusBuyModule.iconVariant}
      />
      <Skeleton variant="rounded" height={64} />
      <Grid container spacing={1.5}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <Skeleton variant="rounded" height={96} />
          </Grid>
        ))}
      </Grid>
      <Skeleton variant="rounded" height={192} />
      <Skeleton variant="rounded" height={160} />
    </PageStack>
  )
}
