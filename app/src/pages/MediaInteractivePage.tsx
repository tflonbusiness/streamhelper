import { Grid, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { MediaInteractiveBurnedSection } from '@/components/media-interactive/media-interactive-page/MediaInteractiveBurnedSection'
import { MediaInteractiveRejectedOrdersSection } from '@/components/media-interactive/media-interactive-page/MediaInteractiveRejectedOrdersSection'
import { MediaInteractiveViewerOrdersSection } from '@/components/media-interactive/media-interactive-page/MediaInteractiveViewerOrdersSection'
import { MediaInteractiveStreamWidgetSection } from '@/components/media-interactive/media-interactive-page/MediaInteractiveStreamWidgetSection'
import { MediaInteractiveWorkspaceSection } from '@/components/media-interactive/media-interactive-page/MediaInteractiveWorkspaceSection'
import { ModulePageHeader } from '@/components/ModulePageHeader'
import { ModulePageShell } from '@/components/ModulePageShell'
import { useAuth } from '@/context/AuthContext'
import { useMediaInteractiveQueue } from '@/queries/use-media-interactive'

const ContentGrid = styled(Grid)({
  alignItems: 'flex-start',
})

const SidebarStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
  position: 'sticky',
  top: theme.spacing(2),
  width: '100%',
}))

export function MediaInteractivePage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const accountId = user?.accountId
  const accountUcid = user?.accountUcid

  const { data: queueData } = useMediaInteractiveQueue(accountId, 'queue')
  const { data: backupData } = useMediaInteractiveQueue(accountId, 'backup')

  const queueItems = queueData?.items ?? []
  const backupItems = backupData?.items ?? []
  const paused = queueData?.playback.settings.playbackPaused ?? false
  const nowPlaying = queueData?.playback.nowPlaying

  return (
    <ModulePageShell moduleId="media-interactive">
      <ModulePageHeader
        moduleId="media-interactive"
        title={t('mediaInteractive.title')}
        description={t('mediaInteractive.description')}
      />
      {accountId !== undefined && accountUcid ? (
        <ContentGrid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <MediaInteractiveWorkspaceSection
              accountId={accountId}
              queueItems={queueItems}
              backupItems={backupItems}
              nowPlaying={nowPlaying}
              paused={paused}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <SidebarStack>
              <MediaInteractiveViewerOrdersSection accountId={accountId} />
              <MediaInteractiveStreamWidgetSection
                accountId={accountId}
                accountUcid={accountUcid}
              />
              <MediaInteractiveBurnedSection accountId={accountId} />
              <MediaInteractiveRejectedOrdersSection accountId={accountId} />
            </SidebarStack>
          </Grid>
        </ContentGrid>
      ) : null}
    </ModulePageShell>
  )
}
