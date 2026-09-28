import { Grid, Skeleton, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import {
  ListCard,
  ListCardContent,
  SettingsCard,
  SettingsCardContent,
} from '@/components/chat-roll/chatRollPageStyles'
import { chatRollModule } from '@/components/chat-roll/session/chat-roll-session-utils'
import { ModuleSessionPageHeader } from '@/components/ModuleSessionPageHeader'
import { StyledSessionCard } from '@/components/prize-spin/session/prizeSpinSessionStyles'

const PageStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(4),
}))

const WORKSPACE_MIN_HEIGHT = 680

const WorkspaceGrid = styled(Grid)(({ theme }) => ({
  alignItems: 'stretch',
  [theme.breakpoints.up('lg')]: {
    minHeight: WORKSPACE_MIN_HEIGHT,
  },
}))

const workspaceColumnSx = {
  display: 'flex',
  minWidth: 0,
  minHeight: 0,
}

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
}))

function SettingsSectionSkeleton() {
  return (
    <SettingsCard elevation={0}>
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
    <ListCard elevation={0}>
      <ListCardContent>
        <Skeleton variant="rounded" height={40} width="68%" animation="wave" />
        <Skeleton
          variant="rounded"
          animation="wave"
          sx={{
            flex: 1,
            minHeight: { xs: 280, lg: WORKSPACE_MIN_HEIGHT - 72 },
            mt: 2,
          }}
        />
      </ListCardContent>
    </ListCard>
  )
}

function ListSectionSkeleton() {
  return (
    <ListCard elevation={0}>
      <ListCardContent>
        <Skeleton variant="rounded" height={40} width="75%" animation="wave" />
        <ListRowsSkeletonStack sx={{ mt: 2 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={36} animation="wave" />
          ))}
        </ListRowsSkeletonStack>
      </ListCardContent>
    </ListCard>
  )
}

export const ChatRollSessionLoadingState = () => {
  return (
    <PageStack aria-busy="true">
      <ModuleSessionPageHeader module={chatRollModule} />
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
      <WorkspaceGrid container spacing={3}>
        <Grid size={{ xs: 12, lg: 3 }} sx={workspaceColumnSx}>
          <SettingsSectionSkeleton />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }} sx={workspaceColumnSx}>
          <ChatSectionSkeleton />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }} sx={workspaceColumnSx}>
          <ListSectionSkeleton />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }} sx={workspaceColumnSx}>
          <ListSectionSkeleton />
        </Grid>
      </WorkspaceGrid>
    </PageStack>
  )
}
