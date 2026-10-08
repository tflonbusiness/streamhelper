import { Grid, Skeleton, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { ModulePageShell } from '@/components/ModulePageShell'
import {
  ModulePageSectionChrome,
  ModulePageSections,
} from '@/components/ModulePageSections'
import { SessionPageBreadcrumbBar } from '@/components/session/SessionPageBreadcrumbBar'
import { MODULE_PAGE_SECTION_SPACING } from '@/lib/module-page-layout'
import { prizeSpinModule } from '@/components/prize-spin/session/prize-spin-session-utils'

const ContentGrid = styled(Grid)({
  alignItems: 'stretch',
})

const ColumnStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(MODULE_PAGE_SECTION_SPACING),
}))

export const PrizeSpinSessionLoadingState = () => {
  return (
    <ModulePageShell moduleId="prize-spin" spacing={0}>
      <ModulePageSections>
        <ModulePageSectionChrome>
          <SessionPageBreadcrumbBar module={prizeSpinModule} />
        </ModulePageSectionChrome>
        <ContentGrid container spacing={3}>
          <Grid size={{ xs: 12, lg: 9 }}>
            <ColumnStack>
              <Skeleton variant="rounded" height={64} />
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 5 }}>
                  <ColumnStack>
                    <Skeleton variant="rounded" height={120} />
                    <Skeleton variant="rounded" height={480} />
                    <Skeleton variant="rounded" height={160} />
                  </ColumnStack>
                </Grid>
                <Grid size={{ xs: 12, lg: 7 }}>
                  <Skeleton variant="rounded" height={480} />
                </Grid>
              </Grid>
            </ColumnStack>
          </Grid>
          <Grid size={{ xs: 12, lg: 3 }}>
            <Skeleton variant="rounded" height={180} />
          </Grid>
        </ContentGrid>
      </ModulePageSections>
    </ModulePageShell>
  )
}
