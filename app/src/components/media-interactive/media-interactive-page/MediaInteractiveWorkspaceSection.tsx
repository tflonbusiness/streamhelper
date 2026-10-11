import { Grid, Typography } from '@mui/material'
import SensorsIcon from '@mui/icons-material/Sensors'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MediaInteractiveItem } from '@/api/media-interactive'
import { SectionDivider, SectionHeader } from '@/components/SectionHeader'
import { useNotification } from '@/context/NotificationContext'
import { MediaInteractiveNowPlayingHero } from '@/components/media-interactive/media-interactive-page/MediaInteractiveNowPlayingHero'
import { MediaInteractiveQueueItemRow } from '@/components/media-interactive/media-interactive-page/MediaInteractiveQueueItemRow'
import { MediaInteractiveStaffAddForm } from '@/components/media-interactive/media-interactive-page/MediaInteractiveStaffAddForm'
import {
  StyledCard,
  StyledCardContent,
  StyledContentStack,
  StyledSubsectionLabel,
  StyledSubsectionStack,
} from '@/components/media-interactive/media-interactive-page/media-interactive-page-styles'
import { useMediaInteractiveMutations } from '@/queries/use-media-interactive'

type MediaInteractiveWorkspaceSectionProps = {
  accountId: number
  queueItems: MediaInteractiveItem[]
  backupItems: MediaInteractiveItem[]
  nowPlaying: MediaInteractiveItem | null | undefined
  paused: boolean
}

export function MediaInteractiveWorkspaceSection({
  accountId,
  queueItems,
  backupItems,
  nowPlaying,
  paused,
}: MediaInteractiveWorkspaceSectionProps) {
  const { t } = useTranslation()
  const { showSuccess } = useNotification()
  const mutations = useMediaInteractiveMutations(accountId)

  const [staffUrl, setStaffUrl] = useState('')
  const [staffTarget, setStaffTarget] = useState<'queue' | 'backup'>('queue')

  const reorder = (list: MediaInteractiveItem[], listKind: 'queue' | 'backup') => {
    return (from: number, to: number) => {
      if (to < 0 || to >= list.length) return
      const ids = [...list.map((i) => i.id)]
      const [removed] = ids.splice(from, 1)
      ids.splice(to, 0, removed)
      void mutations.reorder.mutateAsync({ listKind, orderedIds: ids })
    }
  }

  const handleStaffAdd = () => {
    const url = staffUrl.trim()
    if (!url) return
    void mutations.staffEnqueue
      .mutateAsync({ url, listKind: staffTarget })
      .then(() => {
        setStaffUrl('')
        showSuccess(t('mediaInteractive.added'))
      })
  }

  return (
    <StyledCard>
      <StyledCardContent>
        <StyledContentStack>
          <SectionHeader
            title={t('mediaInteractive.workspaceSectionTitle')}
            description={t('mediaInteractive.workspaceSectionDescription')}
            icon={SensorsIcon}
            iconVariant="danger"
            showDivider={false}
          />

          <MediaInteractiveNowPlayingHero
            nowPlaying={nowPlaying}
            paused={paused}
            onTogglePause={() => void mutations.pause.mutateAsync(!paused)}
            onSkip={() => void mutations.skip.mutateAsync()}
          />

          <MediaInteractiveStaffAddForm
            url={staffUrl}
            target={staffTarget}
            disabled={mutations.staffEnqueue.isPending}
            onUrlChange={setStaffUrl}
            onTargetChange={setStaffTarget}
            onSubmit={handleStaffAdd}
          />

          <SectionDivider />

          <Grid container spacing={3} alignItems="flex-start">
            <Grid size={{ xs: 12, lg: 6 }}>
              <StyledSubsectionStack>
                <StyledSubsectionLabel>
                  {t('mediaInteractive.orderQueue')}
                </StyledSubsectionLabel>
                {queueItems.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('mediaInteractive.queueEmpty')}
                  </Typography>
                ) : (
                  queueItems.map((item, index) => (
                    <MediaInteractiveQueueItemRow
                      key={item.id}
                      item={item}
                      disableUp={index === 0}
                      disableDown={index === queueItems.length - 1}
                      onMoveUp={() =>
                        reorder(queueItems, 'queue')(index, index - 1)
                      }
                      onMoveDown={() =>
                        reorder(queueItems, 'queue')(index, index + 1)
                      }
                      onRemove={() => void mutations.remove.mutateAsync(item.id)}
                    />
                  ))
                )}
              </StyledSubsectionStack>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <StyledSubsectionStack>
                <StyledSubsectionLabel>
                  {t('mediaInteractive.backupList')}
                </StyledSubsectionLabel>
                {backupItems.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('mediaInteractive.backupEmpty')}
                  </Typography>
                ) : (
                  backupItems.map((item, index) => (
                    <MediaInteractiveQueueItemRow
                      key={item.id}
                      item={item}
                      disableUp={index === 0}
                      disableDown={index === backupItems.length - 1}
                      onMoveUp={() =>
                        reorder(backupItems, 'backup')(index, index - 1)
                      }
                      onMoveDown={() =>
                        reorder(backupItems, 'backup')(index, index + 1)
                      }
                      onRemove={() => void mutations.remove.mutateAsync(item.id)}
                    />
                  ))
                )}
              </StyledSubsectionStack>
            </Grid>
          </Grid>
        </StyledContentStack>
      </StyledCardContent>
    </StyledCard>
  )
}
