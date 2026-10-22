import { Grid, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { isFirstReactionReadOnly } from '@/api/first-reaction'
import type { FirstReactionSettings } from '@/api/first-reaction'
import { FirstReactionArchiveDialog } from '@/components/first-reaction/first-reaction-page/FirstReactionArchiveDialog'
import { formatFirstReactionLiveSessionHint } from '@/components/first-reaction/first-reaction-page/first-reaction-page-utils'
import { FirstReactionDrawHistorySection } from '@/components/first-reaction/session/FirstReactionDrawHistorySection'
import { FirstReactionDrawSection } from '@/components/first-reaction/session/FirstReactionDrawSection'
import { FirstReactionSessionErrorState } from '@/components/first-reaction/session/FirstReactionSessionErrorState'
import { FirstReactionEditSessionDialog } from '@/components/first-reaction/session/FirstReactionEditSessionDialog'
import { FirstReactionSessionHeaderSection } from '@/components/first-reaction/session/FirstReactionSessionHeaderSection'
import { FirstReactionSessionLoadingState } from '@/components/first-reaction/session/FirstReactionSessionLoadingState'
import { FirstReactionSettingsSection } from '@/components/first-reaction/session/FirstReactionSettingsSection'
import {
  areFirstReactionSettingsEqual,
  firstReactionModule,
} from '@/components/first-reaction/session/first-reaction-session-utils'
import { ModulePageShell } from '@/components/ModulePageShell'
import {
  ModulePageSectionChrome,
  ModulePageSections,
} from '@/components/ModulePageSections'
import { SessionPageBreadcrumbBar } from '@/components/session/SessionPageBreadcrumbBar'
import { useAuth } from '@/context/AuthContext'
import { useSetBreadcrumbLabel } from '@/context/BreadcrumbContext'
import { useNotification } from '@/context/NotificationContext'
import { canMutateWithEntitlements } from '@/lib/entitlements'
import { MODULE_PAGE_SECTION_SPACING } from '@/lib/module-page-layout'
import { useGoLiveFirstReaction } from '@/queries/use-first-reactions'
import {
  useFirstReactionSession,
  usePatchFirstReactionSession,
  useStartFirstReactionDraw,
  useStopFirstReactionDraw,
} from '@/queries/use-first-reaction-session'

const ColumnStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(MODULE_PAGE_SECTION_SPACING),
  width: '100%',
}))

export function FirstReactionSessionPage() {
  const { t } = useTranslation()
  const { showError, showSuccess } = useNotification()
  const { id } = useParams()
  const firstReactionId = Number.parseInt(id ?? '', 10)
  const isValidId = Number.isFinite(firstReactionId)
  const { user } = useAuth()
  const accountId = user?.accountId

  const [archiveOpen, setArchiveOpen] = useState(false)
  const [editSessionDialogOpen, setEditSessionDialogOpen] = useState(false)
  const [manualKeyword, setManualKeyword] = useState('')
  const [settingsDraft, setSettingsDraft] =
    useState<FirstReactionSettings | null>(null)

  const { data, isLoading, error } = useFirstReactionSession(
    accountId,
    isValidId ? firstReactionId : Number.NaN,
  )

  const goLiveMutation = useGoLiveFirstReaction(accountId)
  const patchMutation = usePatchFirstReactionSession(accountId, firstReactionId)
  const startMutation = useStartFirstReactionDraw(accountId, firstReactionId)
  const stopMutation = useStopFirstReactionDraw(accountId, firstReactionId)

  const record = data?.record
  const activeDraw = data?.activeDraw ?? null
  useSetBreadcrumbLabel(record ? `${record.title} #${record.id}` : null)

  if (!isValidId || isLoading) {
    return <FirstReactionSessionLoadingState />
  }

  if (error || !record || accountId === undefined) {
    return (
      <FirstReactionSessionErrorState
        message={
          error instanceof Error
            ? error.message
            : t('firstReaction.sessionNotFound')
        }
      />
    )
  }

  const readOnly = isFirstReactionReadOnly(record)
  const isLive = record.status === 'live'
  const settings = settingsDraft ?? record.settings
  const isSettingsDirty =
    settingsDraft !== null &&
    !areFirstReactionSettingsEqual(settingsDraft, record.settings)
  const canMutate = canMutateWithEntitlements(undefined)
  const activeDrawId = activeDraw?.id

  const saveSettings = () => {
    patchMutation.mutate(
      { settings },
      {
        onSuccess: () => {
          showSuccess(t('firstReaction.settingsSaved'))
          setSettingsDraft(null)
        },
        onError: (e) =>
          showError(
            e instanceof Error
              ? e.message
              : t('firstReaction.couldNotSaveSettings'),
          ),
      },
    )
  }

  return (
    <ModulePageShell moduleId="first-reaction" spacing={0}>
      <ModulePageSections
        spacing={MODULE_PAGE_SECTION_SPACING}
        sx={{ pb: 2, width: '100%' }}
      >
        <ModulePageSectionChrome>
          <SessionPageBreadcrumbBar module={firstReactionModule} />
        </ModulePageSectionChrome>
        <ModulePageSectionChrome>
          <FirstReactionSessionHeaderSection
            accountId={accountId}
            firstReactionId={firstReactionId}
            record={record}
            goLiveDisabled={!canMutate}
            liveActionPending={goLiveMutation.isPending}
            onGoLive={() =>
              goLiveMutation.mutate(firstReactionId, {
                onSuccess: () =>
                  showSuccess(formatFirstReactionLiveSessionHint(t)),
                onError: (e) =>
                  showError(
                    e instanceof Error
                      ? e.message
                      : t('firstReaction.couldNotGoLive'),
                  ),
              })
            }
            onOpenArchiveDialog={() => setArchiveOpen(true)}
            onOpenEditDialog={() => setEditSessionDialogOpen(true)}
          />
        </ModulePageSectionChrome>
        <Grid container spacing={3} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: 8 }}>
            <ColumnStack>
              <FirstReactionDrawSection
                record={{ ...record, settings }}
                activeDraw={activeDraw}
                manualKeyword={manualKeyword}
                onManualKeywordChange={setManualKeyword}
                isLive={isLive}
                readOnly={readOnly}
                startPending={startMutation.isPending}
                stopPending={stopMutation.isPending}
                onStart={() =>
                  startMutation.mutate(
                    record.settings.wordSource === 'manual' &&
                      record.settings.manualScope === 'per_draw'
                      ? manualKeyword.trim()
                      : undefined,
                    {
                      onError: (e) =>
                        showError(
                          e instanceof Error
                            ? e.message
                            : t('firstReaction.couldNotStart'),
                        ),
                    },
                  )
                }
                onStop={() =>
                  activeDrawId && stopMutation.mutate(activeDrawId)
                }
              />
              <FirstReactionDrawHistorySection
                accountId={accountId}
                firstReactionId={firstReactionId}
                readOnly={readOnly}
                pollWhileAccepting={activeDraw?.phase === 'accepting'}
              />
            </ColumnStack>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <ColumnStack>
              <FirstReactionSettingsSection
                settings={settings}
                readOnly={readOnly}
                isDirty={isSettingsDirty}
                savePending={patchMutation.isPending}
                onChange={(next) => setSettingsDraft(next)}
                onSave={saveSettings}
              />
            </ColumnStack>
          </Grid>
        </Grid>
      </ModulePageSections>
      <FirstReactionArchiveDialog
        accountId={accountId}
        open={archiveOpen}
        record={record}
        onClose={() => setArchiveOpen(false)}
      />
      <FirstReactionEditSessionDialog
        accountId={accountId}
        firstReactionId={firstReactionId}
        record={record}
        open={editSessionDialogOpen}
        onClose={() => setEditSessionDialogOpen(false)}
      />
    </ModulePageShell>
  )
}
