import { Grid, Skeleton, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { ModuleSessionPageHeader } from '@/components/ModuleSessionPageHeader'
import { prizeSpinModule } from '@/components/prize-spin/session/prize-spin-session-utils'

const PageStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(4),
}))

const ContentGrid = styled(Grid)({
  alignItems: 'stretch',
})

const ColumnStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
}))

export const PrizeSpinSessionLoadingState = () => {
  return (
    <PageStack>
      <ModuleSessionPageHeader module={prizeSpinModule} />
      <ContentGrid container spacing={3}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <ColumnStack>
            <Skeleton variant="rounded" height={64} />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <ColumnStack>
                  <Skeleton variant="rounded" height={120} />
                  <Skeleton variant="rounded" height={280} />
                </ColumnStack>
              </Grid>
              <Grid size={{ xs: 12, lg: 5 }}>
                <ColumnStack>
                  <Skeleton variant="rounded" height={160} />
                  <Skeleton variant="rounded" height={280} />
                </ColumnStack>
              </Grid>
            </Grid>
          </ColumnStack>
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <Skeleton variant="rounded" height={180} />
        </Grid>
      </ContentGrid>
    </PageStack>
  )
}
