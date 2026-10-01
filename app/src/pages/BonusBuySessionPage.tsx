import { Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatBonusBuyLiveSessionHint } from '@/components/bonus-buy/bonus-buy-page/bonus-buy-page-utils'
import { useNotification } from '@/context/NotificationContext'
import { useParams } from 'react-router-dom'
import { ModuleSessionPageHeader } from '@/components/ModuleSessionPageHeader'
import { BonusBuyEditSessionDialog } from '@/components/bonus-buy/session/BonusBuyEditSessionDialog'
import { BonusBuyArchiveSessionDialog } from '@/components/bonus-buy/session/BonusBuyArchiveSessionDialog'
import { BonusBuySessionAddSlotSection } from '@/components/bonus-buy/session/BonusBuySessionAddSlotSection'
import { BonusBuySessionErrorState } from '@/components/bonus-buy/session/BonusBuySessionErrorState'
import { BonusBuySessionHeaderSection } from '@/components/bonus-buy/session/BonusBuySessionHeaderSection'
import { BonusBuySessionLoadingState } from '@/components/bonus-buy/session/BonusBuySessionLoadingState'
import { BonusBuySessionSlotsSection } from '@/components/bonus-buy/session/BonusBuySessionSlotsSection'
import { BonusBuySessionStatsSection } from '@/components/bonus-buy/session/BonusBuySessionStatsSection'
import { EntitlementOverLimitAlert } from '@/components/EntitlementOverLimitAlert'
import {
  canMutateWithEntitlements,
  canGoLiveBonusBuySession,
  isAtBonusBuySlotCap,
} from '@/lib/entitlements'
import { bonusBuyModule } from '@/components/bonus-buy/session/bonus-buy-session-utils'
import { useAuth } from '@/context/AuthContext'
import { useSetBreadcrumbLabel } from '@/context/BreadcrumbContext'
import { computeSessionStats } from '@/lib/bonus-buy-stats'
import {
  useBonusBuySession,
  useBonusBuyWidget,
  useGoLiveBonusBuySession,
} from '@/queries/use-bonus-buy'

const PageStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(4),
}))

const MainColumnStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
}))

export const BonusBuySessionPage = () => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useNotification()
  const { id } = useParams()
  const bonusBuyId = Number.parseInt(id ?? '', 10)
  const isValidId = Number.isFinite(bonusBuyId)
  const { user } = useAuth()

  const [editSessionDialogOpen, setEditSessionDialogOpen] = useState(false)
  const [archiveSessionDialogOpen, setArchiveSessionDialogOpen] = useState(false)
  const {
    data: session,
    isLoading: loading,
    error: sessionError,
  } = useBonusBuySession(
    user?.accountId,
    isValidId ? bonusBuyId : null,
  )
  const { data: widgetSettings } = useBonusBuyWidget(
    user?.accountId,
    isValidId,
  )
  const goLiveMutation = useGoLiveBonusBuySession(
    user?.accountId,
    isValidId ? bonusBuyId : null,
  )

  const record = session?.record ?? null
  const slots = session?.slots ?? []
  const error = !isValidId
    ? t('errors.invalidBonusBuyId')
    : sessionError instanceof Error
      ? sessionError.message
      : sessionError
        ? t('bonusBuy.couldNotLoad')
        : null

  useSetBreadcrumbLabel(record ? `${record.name} #${record.id}` : null)

  const stats = useMemo(() => {
    if (!record) {
      return computeSessionStats('0', [])
    }
    return computeSessionStats(
      record.startBalance,
      slots.map((slot) => ({
        purchaseAmount: slot.purchaseAmount,
        winAmount: slot.winAmount,
      })),
    )
  }, [record, slots])

  if (loading) {
    return <BonusBuySessionLoadingState />
  }

  if (
    error ||
    !record ||
    user?.accountId === undefined ||
    !user.accountUcid
  ) {
    return (
      <BonusBuySessionErrorState
        message={error ?? t('bonusBuy.sessionNotFound')}
      />
    )
  }

  const accountId = user.accountId
  const envelope = session?.envelope
  const canMutate = canMutateWithEntitlements(envelope)
  const canAddSlot = canMutate && !isAtBonusBuySlotCap(envelope)

  return (
    <PageStack>
      <ModuleSessionPageHeader module={bonusBuyModule} />
      <EntitlementOverLimitAlert envelope={envelope} />
      <MainColumnStack>
            <BonusBuySessionHeaderSection
              record={record}
              liveActionPending={goLiveMutation.isPending}
              goLiveDisabled={!canGoLiveBonusBuySession(envelope)}
              onGoLive={() => {
                goLiveMutation.mutate(undefined, {
                  onSuccess: () =>
                    showSuccess(formatBonusBuyLiveSessionHint(t)),
                  onError: (error) =>
                    showError(
                      error instanceof Error
                        ? error.message
                        : t('bonusBuy.couldNotGoLive'),
                    ),
                })
              }}
              onOpenArchiveDialog={() => setArchiveSessionDialogOpen(true)}
              onOpenEditDialog={() => setEditSessionDialogOpen(true)}
            />
            <BonusBuySessionStatsSection
              record={record}
              stats={stats}
              averageXPositiveColor={widgetSettings?.positiveColor}
            />
            <BonusBuySessionAddSlotSection
              accountId={accountId}
              bonusBuyId={bonusBuyId}
              record={record}
              canAddSlot={canAddSlot}
            />
            <BonusBuySessionSlotsSection
              accountId={accountId}
              bonusBuyId={bonusBuyId}
              currencyCode={record.currencyCode}
              slots={slots}
              widgetPositiveColor={widgetSettings?.positiveColor}
              widgetNegativeColor={widgetSettings?.negativeColor}
            />
      </MainColumnStack>
      <BonusBuyEditSessionDialog
        accountId={accountId}
        bonusBuyId={bonusBuyId}
        record={record}
        open={editSessionDialogOpen}
        onClose={() => setEditSessionDialogOpen(false)}
      />
      <BonusBuyArchiveSessionDialog
        accountId={accountId}
        bonusBuyId={bonusBuyId}
        record={record}
        open={archiveSessionDialogOpen}
        onClose={() => setArchiveSessionDialogOpen(false)}
      />
    </PageStack>
  )
}
