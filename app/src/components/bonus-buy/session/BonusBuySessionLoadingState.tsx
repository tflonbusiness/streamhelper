import { Grid, Skeleton, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { ModulePageShell } from '@/components/ModulePageShell'
import {
  ModulePageSectionChrome,
  ModulePageSections,
} from '@/components/ModulePageSections'
import { SessionPageBreadcrumbBar } from '@/components/session/SessionPageBreadcrumbBar'
import { MODULE_PAGE_SECTION_SPACING } from '@/lib/module-page-layout'
import { bonusBuyModule } from '@/components/bonus-buy/session/bonus-buy-session-utils'

const ContentGrid = styled(Grid)({
  alignItems: 'stretch',
})

const ColumnStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(MODULE_PAGE_SECTION_SPACING),
}))

export const BonusBuySessionLoadingState = () => {
  return (
    <ModulePageShell moduleId="bonus-buy" spacing={0}>
      <ModulePageSections>
        <ModulePageSectionChrome>
          <SessionPageBreadcrumbBar module={bonusBuyModule} />
        </ModulePageSectionChrome>
        <ContentGrid container spacing={3}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <ColumnStack>
            <Skeleton variant="rounded" height={64} />
            <Grid container spacing={1.5}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, lg: 2.4 }}>
                  <Skeleton variant="rounded" height={96} />
                </Grid>
              ))}
            </Grid>
            <Skeleton variant="rounded" height={192} />
            <Skeleton variant="rounded" height={280} />
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
