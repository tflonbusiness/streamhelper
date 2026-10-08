import { Grid, Skeleton, Stack, useTheme } from '@mui/material'
import { styled } from '@mui/material/styles'
import {
  SettingsCard,
  SettingsCardContent,
  WorkspaceListCard,
  WorkspaceListCardContent,
} from '@/components/chat-roll/chatRollPageStyles'
import { chatRollModule } from '@/components/chat-roll/session/chat-roll-session-utils'
import {
  chatRollSessionPageShellSx,
  chatRollSessionWorkspaceCardSx,
  chatRollSessionWorkspaceColumnSx,
  chatRollSessionWorkspaceGridSx,
} from '@/components/chat-roll/session/chat-roll-session-workspace-layout'
import { ModulePageShell } from '@/components/ModulePageShell'
import {
  ModulePageSectionChrome,
  ModulePageSections,
} from '@/components/ModulePageSections'
import { ModuleSessionPageHeader } from '@/components/ModuleSessionPageHeader'
import { StyledSessionCard } from '@/components/prize-spin/session/prizeSpinSessionStyles'

const WorkspaceGrid = styled(Grid)(({ theme }) => chatRollSessionWorkspaceGridSx(theme))

const HeaderCardContent = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(2),
  gap: theme.spacing(2),
}))

const SettingsInnerStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
  flex: 1,
}))

const ListRowsSkeletonStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1),
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
}))

function SettingsSectionSkeleton() {
  return (
    <SettingsCard elevation={0} sx={chatRollSessionWorkspaceCardSx}>
      <SettingsCardContent>
        <Skeleton variant="rounded" height={40} width="72%" animation="wave" />
        <SettingsInnerStack>
          <Skeleton variant="rounded" height={36} animation="wave" />
          <Skeleton variant="rounded" height={36} animation="wave" />
          <Skeleton variant="rounded" height={72} animation="wave" />
          <Skeleton
            variant="rounded"
            animation="wave"
            sx={{ flex: 1, minHeight: 200 }}
          />
        </SettingsInnerStack>
      </SettingsCardContent>
    </SettingsCard>
  )
}

function ChatSectionSkeleton() {
  return (
    <WorkspaceListCard elevation={0} sx={chatRollSessionWorkspaceCardSx}>
      <WorkspaceListCardContent>
        <Skeleton variant="rounded" height={40} width="68%" animation="wave" />
        <Skeleton
          variant="rounded"
          animation="wave"
          sx={{
            flex: 1,
            minHeight: { xs: 280, lg: 0 },
            mt: 2,
          }}
        />
      </WorkspaceListCardContent>
    </WorkspaceListCard>
  )
}

function ListSectionSkeleton() {
  return (
    <WorkspaceListCard elevation={0} sx={chatRollSessionWorkspaceCardSx}>
      <WorkspaceListCardContent>
        <Skeleton variant="rounded" height={40} width="75%" animation="wave" />
        <ListRowsSkeletonStack sx={{ mt: 2 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={36} animation="wave" />
          ))}
        </ListRowsSkeletonStack>
      </WorkspaceListCardContent>
    </WorkspaceListCard>
  )
}

export const ChatRollSessionLoadingState = () => {
  const theme = useTheme()

  return (
    <ModulePageShell
      moduleId="chat-roll"
      spacing={0}
      sx={chatRollSessionPageShellSx(theme)}
    >
      <ModulePageSections
        sx={{
          flex: { lg: '1 1 0' },
          minHeight: 0,
          minWidth: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ModulePageSectionChrome>
          <ModuleSessionPageHeader module={chatRollModule} />
        </ModulePageSectionChrome>
        <ModulePageSectionChrome>
          <StyledSessionCard elevation={0}>
            <HeaderCardContent direction={{ xs: 'column', lg: 'row' }}>
              <Skeleton variant="rounded" height={32} width="55%" animation="wave" />
              <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                <Skeleton variant="rounded" width={100} height={32} animation="wave" />
                <Skeleton variant="rounded" width={120} height={32} animation="wave" />
                <Skeleton variant="rounded" width={40} height={32} animation="wave" />
              </Stack>
            </HeaderCardContent>
          </StyledSessionCard>
        </ModulePageSectionChrome>
        <WorkspaceGrid container spacing={3}>
        <Grid size={{ xs: 12, lg: 3 }} sx={chatRollSessionWorkspaceColumnSx(theme)}>
          <SettingsSectionSkeleton />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }} sx={chatRollSessionWorkspaceColumnSx(theme)}>
          <ChatSectionSkeleton />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }} sx={chatRollSessionWorkspaceColumnSx(theme)}>
          <ListSectionSkeleton />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }} sx={chatRollSessionWorkspaceColumnSx(theme)}>
          <ListSectionSkeleton />
        </Grid>
      </WorkspaceGrid>
      </ModulePageSections>
    </ModulePageShell>
  )
}
