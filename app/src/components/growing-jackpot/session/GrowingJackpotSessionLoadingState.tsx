import { Grid, Skeleton, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { ModulePageShell } from '@/components/ModulePageShell'
import {
  ModulePageSectionChrome,
  ModulePageSections,
} from '@/components/ModulePageSections'
import { growingJackpotModule } from '@/components/growing-jackpot/session/growing-jackpot-session-utils'
import { SessionPageBreadcrumbBar } from '@/components/session/SessionPageBreadcrumbBar'
import { MODULE_PAGE_SECTION_SPACING } from '@/lib/module-page-layout'

const ColumnStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(MODULE_PAGE_SECTION_SPACING),
}))

export function GrowingJackpotSessionLoadingState() {
  return (
    <ModulePageShell moduleId="growing-jackpot" spacing={0}>
      <ModulePageSections>
        <ModulePageSectionChrome>
          <SessionPageBreadcrumbBar
            module={growingJackpotModule}
            showModuleTitle={false}
          />
        </ModulePageSectionChrome>
        <Grid container spacing={3} sx={{ width: '100%' }}>
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
