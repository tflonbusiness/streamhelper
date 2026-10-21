import { Grid, Skeleton, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { ModulePageShell } from '@/components/ModulePageShell'
import {
  ModulePageSectionChrome,
  ModulePageSections,
} from '@/components/ModulePageSections'
import { SessionPageBreadcrumbBar } from '@/components/session/SessionPageBreadcrumbBar'
import { firstReactionModule } from '@/components/first-reaction/session/first-reaction-session-utils'
import { MODULE_PAGE_SECTION_SPACING } from '@/lib/module-page-layout'

const ColumnStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(MODULE_PAGE_SECTION_SPACING),
}))

export function FirstReactionSessionLoadingState() {
  return (
    <ModulePageShell moduleId="first-reaction" spacing={0}>
      <ModulePageSections>
        <ModulePageSectionChrome>
          <SessionPageBreadcrumbBar module={firstReactionModule} />
        </ModulePageSectionChrome>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <ColumnStack>
              <Skeleton variant="rounded" height={72} />
              <Skeleton variant="rounded" height={280} />
              <Skeleton variant="rounded" height={200} />
            </ColumnStack>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Skeleton variant="rounded" height={360} />
          </Grid>
        </Grid>
      </ModulePageSections>
    </ModulePageShell>
  )
}
