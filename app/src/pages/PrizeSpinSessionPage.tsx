import { Grid, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { isPrizeSpinReadOnly } from '@/api/prize-spin'
import { ModulePageShell } from '@/components/ModulePageShell'
import { ModuleSessionPageHeader } from '@/components/ModuleSessionPageHeader'
import { PrizeSpinSessionArchiveDialog } from '@/components/prize-spin/session/PrizeSpinSessionArchiveDialog'
import { PrizeSpinSessionErrorState } from '@/components/prize-spin/session/PrizeSpinSessionErrorState'
import { PrizeSpinSessionHeaderSection } from '@/components/prize-spin/session/PrizeSpinSessionHeaderSection'
import { PrizeSpinSessionLoadingState } from '@/components/prize-spin/session/PrizeSpinSessionLoadingState'
import { PrizeSpinSessionSectorsSection } from '@/components/prize-spin/session/PrizeSpinSessionSectorsSection'
import { PrizeSpinSessionSpinSection } from '@/components/prize-spin/session/PrizeSpinSessionSpinSection'
import { PrizeSpinSessionStatsCard } from '@/components/prize-spin/session/PrizeSpinSessionStatsCard'
import { PrizeSpinSessionWinnersSection } from '@/components/prize-spin/session/PrizeSpinSessionWinnersSection'
import { prizeSpinModule } from '@/components/prize-spin/session/prize-spin-session-utils'
import { useAuth } from '@/context/AuthContext'
import { useSetBreadcrumbLabel } from '@/context/BreadcrumbContext'
import { useNotification } from '@/context/NotificationContext'
import { EntitlementOverLimitAlert } from '@/components/EntitlementOverLimitAlert'
import {
  canMutateWithEntitlements,
  canGoLivePrizeSpinSession,
  isAtPrizeSpinSectorCap,
} from '@/lib/entitlements'
import { formatPrizeSpinLiveSessionHint } from '@/components/prize-spin/prize-spin-page/prize-spin-page-utils'
import {
  useGoLivePrizeSpinSession,
  usePrizeSpinSession,
} from '@/queries/use-prize-spin-session'

const MainColumnStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
}))

const WorkspaceColumnStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
}))

export const PrizeSpinSessionPage = () => {
  const { t } = useTranslation()
  const { showError, showSuccess } = useNotification()
  const { id } = useParams()
  const prizeSpinId = Number.parseInt(id ?? '', 10)
  const isValidId = Number.isFinite(prizeSpinId)
  const { user } = useAuth()

  const [archiveSessionDialogOpen, setArchiveSessionDialogOpen] = useState(false)
  const {
    data: session,
    isLoading: loading,
    error: sessionError,
  } = usePrizeSpinSession(user?.accountId, isValidId ? prizeSpinId : Number.NaN)
  const goLiveMutation = useGoLivePrizeSpinSession(
    user?.accountId,
    isValidId ? prizeSpinId : Number.NaN,
  )

  const record = session?.record ?? null
  const sectors = session?.sectors ?? []
  const wins = session?.wins ?? []
  const error = !isValidId
    ? t('prizeSpin.sessionNotFound')
    : sessionError instanceof Error
      ? sessionError.message
      : sessionError
        ? t('prizeSpin.couldNotLoadSession')
        : null

  useSetBreadcrumbLabel(record ? `${record.title} #${record.id}` : null)

  if (loading) {
    return <PrizeSpinSessionLoadingState />
  }

  if (
    error ||
    !record ||
    user?.accountId === undefined ||
    !user.accountUcid
  ) {
    return (
      <PrizeSpinSessionErrorState
        message={error ?? t('prizeSpin.sessionNotFound')}
      />
    )
  }

  const readOnly = isPrizeSpinReadOnly(record)
  const accountId = user.accountId
  const envelope = session?.envelope
  const canMutate = canMutateWithEntitlements(envelope)
  const canAddSector = canMutate && !isAtPrizeSpinSectorCap(envelope)
  const editingDisabled = readOnly || !canMutate

  return (
    <ModulePageShell moduleId="prize-spin">
      <ModuleSessionPageHeader module={prizeSpinModule} />
      <EntitlementOverLimitAlert envelope={envelope} />
      <MainColumnStack>
            <PrizeSpinSessionHeaderSection
              accountId={accountId}
              prizeSpinId={prizeSpinId}
              record={record}
              wins={wins}
              liveActionPending={goLiveMutation.isPending}
              goLiveDisabled={!canGoLivePrizeSpinSession(envelope)}
              onGoLive={() => {
                goLiveMutation.mutate(undefined, {
                  onSuccess: () =>
                    showSuccess(formatPrizeSpinLiveSessionHint(t)),
                  onError: (error) =>
                    showError(
                      error instanceof Error
                        ? error.message
                        : t('prizeSpin.couldNotGoLive'),
                    ),
                })
              }}
              onOpenArchiveDialog={() => setArchiveSessionDialogOpen(true)}
            />
            <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <WorkspaceColumnStack>
                  <PrizeSpinSessionSpinSection
                    accountId={accountId}
                    prizeSpinId={prizeSpinId}
                    sectors={sectors}
                    readOnly={editingDisabled}
                  />
                  <PrizeSpinSessionSectorsSection
                    accountId={accountId}
                    prizeSpinId={prizeSpinId}
                    sectors={sectors}
                    readOnly={readOnly}
                    canMutate={canMutate}
                    canAddSector={canAddSector}
                  />
                </WorkspaceColumnStack>
              </Grid>
              <Grid size={{ xs: 12, lg: 5 }}>
                <WorkspaceColumnStack>
                  <PrizeSpinSessionStatsCard wins={wins} sectors={sectors} />
                  <PrizeSpinSessionWinnersSection
                    accountId={accountId}
                    prizeSpinId={prizeSpinId}
                    wins={wins}
                    readOnly={readOnly}
                  />
                </WorkspaceColumnStack>
              </Grid>
            </Grid>
      </MainColumnStack>
      <PrizeSpinSessionArchiveDialog
        accountId={accountId}
        prizeSpinId={prizeSpinId}
        record={record}
        open={archiveSessionDialogOpen}
        onClose={() => setArchiveSessionDialogOpen(false)}
      />
    </ModulePageShell>
  )
}
