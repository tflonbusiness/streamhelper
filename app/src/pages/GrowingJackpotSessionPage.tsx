import { Grid, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { isGrowingJackpotReadOnly } from '@/api/growing-jackpot'
import type { GrowingJackpotSettings } from '@/api/growing-jackpot'
import { GrowingJackpotArchiveDialog } from '@/components/growing-jackpot/session/GrowingJackpotArchiveDialog'
import { GrowingJackpotEditSessionDialog } from '@/components/growing-jackpot/session/GrowingJackpotEditSessionDialog'
import { GrowingJackpotRoundHistorySection } from '@/components/growing-jackpot/session/GrowingJackpotRoundHistorySection'
import { GrowingJackpotRoundSection } from '@/components/growing-jackpot/session/GrowingJackpotRoundSection'
import { GrowingJackpotSessionErrorState } from '@/components/growing-jackpot/session/GrowingJackpotSessionErrorState'
import { GrowingJackpotSessionHeaderSection } from '@/components/growing-jackpot/session/GrowingJackpotSessionHeaderSection'
import { GrowingJackpotSessionLoadingState } from '@/components/growing-jackpot/session/GrowingJackpotSessionLoadingState'
import { GrowingJackpotSettingsSection } from '@/components/growing-jackpot/session/GrowingJackpotSettingsSection'
import {
  areGrowingJackpotSettingsEqual,
  growingJackpotModule,
} from '@/components/growing-jackpot/session/growing-jackpot-session-utils'
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
import { useGoLiveGrowingJackpot } from '@/queries/use-growing-jackpots'
import {
  useGrowingJackpotSession,
  useDeactivateGrowingJackpot,
  usePatchGrowingJackpotSession,
  useStartGrowingJackpotRound,
  useStopGrowingJackpotRound,
} from '@/queries/use-growing-jackpot-session'

const ColumnStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(MODULE_PAGE_SECTION_SPACING),
  width: '100%',
}))

export function GrowingJackpotSessionPage() {
  const { t } = useTranslation()
  const { showError, showSuccess } = useNotification()
  const { id } = useParams()
  const growingJackpotId = Number.parseInt(id ?? '', 10)
  const isValidId = Number.isFinite(growingJackpotId)
  const { user } = useAuth()
  const accountId = user?.accountId

  const [settingsDraft, setSettingsDraft] =
    useState<GrowingJackpotSettings | null>(null)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const { data, isLoading, error } = useGrowingJackpotSession(
    accountId,
    isValidId ? growingJackpotId : Number.NaN,
  )

  const goLiveMutation = useGoLiveGrowingJackpot(accountId)
  const patchMutation = usePatchGrowingJackpotSession(accountId, growingJackpotId)
  const startMutation = useStartGrowingJackpotRound(accountId, growingJackpotId)
  const stopMutation = useStopGrowingJackpotRound(accountId, growingJackpotId)
  const deactivateMutation = useDeactivateGrowingJackpot(
    accountId,
    growingJackpotId,
  )

  const record = data?.session
  const activeRound = data?.activeRound ?? null
  const isAccepting = activeRound?.phase === 'accepting'
  useSetBreadcrumbLabel(record ? `${record.title} #${record.id}` : null)

  if (!isValidId || isLoading) {
    return <GrowingJackpotSessionLoadingState />
  }

  if (error || !record || accountId === undefined) {
    return (
      <GrowingJackpotSessionErrorState
        message={
          error instanceof Error
            ? error.message
            : t('growingJackpot.sessionNotFound')
        }
      />
    )
  }

  const readOnly = isGrowingJackpotReadOnly(record)
  const isLive = record.status === 'live'
  const settings = settingsDraft ?? record.settings
  const isSettingsDirty =
    settingsDraft !== null &&
    !areGrowingJackpotSettingsEqual(settingsDraft, record.settings)
  const canMutate = canMutateWithEntitlements(undefined)
  const activeRoundId = activeRound?.id

  const saveSettings = () => {
    patchMutation.mutate(
      { settings },
      {
        onSuccess: () => {
          showSuccess(t('growingJackpot.settingsSaved'))
          setSettingsDraft(null)
        },
        onError: (e) =>
          showError(
            e instanceof Error
              ? e.message
              : t('growingJackpot.couldNotSaveSettings'),
          ),
      },
    )
  }

  return (
    <ModulePageShell moduleId="growing-jackpot" spacing={0}>
      <ModulePageSections
        spacing={MODULE_PAGE_SECTION_SPACING}
        sx={{ pb: 2, width: '100%' }}
      >
        <ModulePageSectionChrome>
          <SessionPageBreadcrumbBar module={growingJackpotModule} />
        </ModulePageSectionChrome>
        <ModulePageSectionChrome>
          <GrowingJackpotSessionHeaderSection
            record={record}
            goLiveDisabled={!canMutate}
            liveActionPending={goLiveMutation.isPending}
            deactivatePending={deactivateMutation.isPending}
            onOpenArchiveDialog={() => setArchiveOpen(true)}
            onOpenEditDialog={() => setEditOpen(true)}
            onGoLive={() =>
              goLiveMutation.mutate(growingJackpotId, {
                onSuccess: () => showSuccess(t('growingJackpot.wentLive')),
                onError: (e) =>
                  showError(
                    e instanceof Error
                      ? e.message
                      : t('growingJackpot.couldNotGoLive'),
                  ),
              })
            }
            onDeactivate={() =>
              deactivateMutation.mutate(undefined, {
                onSuccess: () => showSuccess(t('growingJackpot.wentOffAir')),
                onError: (e) =>
                  showError(
                    e instanceof Error
                      ? e.message
                      : t('growingJackpot.couldNotGoOffAir'),
                  ),
              })
            }
          />
        </ModulePageSectionChrome>
        <Grid container spacing={3} alignItems="flex-start" sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <ColumnStack>
              <GrowingJackpotRoundSection
                isLive={isLive}
                readOnly={readOnly}
                activeRound={activeRound}
                startPending={startMutation.isPending}
                stopPending={stopMutation.isPending}
                onStart={() =>
                  startMutation.mutate(undefined, {
                    onError: (e) =>
                      showError(
                        e instanceof Error
                          ? e.message
                          : t('growingJackpot.couldNotStartRound'),
                      ),
                  })
                }
                onStop={() =>
                  activeRoundId &&
                  stopMutation.mutate(activeRoundId, {
                    onError: (e) =>
                      showError(
                        e instanceof Error
                          ? e.message
                          : t('growingJackpot.couldNotStopRound'),
                      ),
                  })
                }
              />
              <GrowingJackpotRoundHistorySection
                accountId={accountId}
                growingJackpotId={growingJackpotId}
                readOnly={readOnly}
                pollWhileAccepting={isAccepting}
              />
            </ColumnStack>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <ColumnStack>
              <GrowingJackpotSettingsSection
                settings={settings}
                readOnly={readOnly}
                fieldsLocked={isAccepting}
                isDirty={isSettingsDirty}
                savePending={patchMutation.isPending}
                onChange={(next) => setSettingsDraft(next)}
                onSave={saveSettings}
              />
            </ColumnStack>
          </Grid>
        </Grid>
      </ModulePageSections>
      <GrowingJackpotArchiveDialog
        accountId={accountId}
        open={archiveOpen}
        record={record}
        onClose={() => setArchiveOpen(false)}
      />
      <GrowingJackpotEditSessionDialog
        accountId={accountId}
        growingJackpotId={growingJackpotId}
        record={record}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </ModulePageShell>
  )
}
