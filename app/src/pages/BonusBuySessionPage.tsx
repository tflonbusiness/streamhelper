import { Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { BonusBuyEditSessionDialog } from '@/components/bonus-buy/session/BonusBuyEditSessionDialog'
import { BonusBuyArchiveSessionDialog } from '@/components/bonus-buy/session/BonusBuyArchiveSessionDialog'
import { BonusBuySessionAddSlotSection } from '@/components/bonus-buy/session/BonusBuySessionAddSlotSection'
import { BonusBuySessionErrorState } from '@/components/bonus-buy/session/BonusBuySessionErrorState'
import { BonusBuySessionHeaderSection } from '@/components/bonus-buy/session/BonusBuySessionHeaderSection'
import { BonusBuySessionLoadingState } from '@/components/bonus-buy/session/BonusBuySessionLoadingState'
import { BonusBuySessionSlotsSection } from '@/components/bonus-buy/session/BonusBuySessionSlotsSection'
import { BonusBuySessionStatsSection } from '@/components/bonus-buy/session/BonusBuySessionStatsSection'
import { BonusBuyWidgetStyleDialog } from '@/components/bonus-buy/session/BonusBuyWidgetStyleDialog'
import { bonusBuyModule } from '@/components/bonus-buy/session/bonus-buy-session-utils'
import { useAuth } from '@/context/AuthContext'
import { useSetBreadcrumbLabel } from '@/context/BreadcrumbContext'
import { computeSessionStats } from '@/lib/bonus-buy-stats'
import { useBonusBuySession, useBonusBuyWidget } from '@/queries/use-bonus-buy'

const PageStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(4),
}))

export const BonusBuySessionPage = () => {
  const { id } = useParams()
  const bonusBuyId = Number.parseInt(id ?? '', 10)
  const isValidId = Number.isFinite(bonusBuyId)
  const { user } = useAuth()

  const [editSessionDialogOpen, setEditSessionDialogOpen] = useState(false)
  const [archiveSessionDialogOpen, setArchiveSessionDialogOpen] = useState(false)
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false)

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
    isValidId ? bonusBuyId : null,
    isValidId,
  )

  const record = session?.record ?? null
  const slots = session?.slots ?? []
  const error = !isValidId
    ? 'Invalid bonus buy id'
    : sessionError instanceof Error
      ? sessionError.message
      : sessionError
        ? 'Could not load bonus buy'
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

  if (error || !record || user?.accountId === undefined) {
    return (
      <BonusBuySessionErrorState
        message={error ?? 'Session not found'}
      />
    )
  }

  const accountId = user.accountId

  return (
    <PageStack>
      <PageHeader
        title={bonusBuyModule.name}
        description={bonusBuyModule.description}
        icon={bonusBuyModule.icon}
        iconVariant={bonusBuyModule.iconVariant}
      />
      <BonusBuySessionHeaderSection
        bonusBuyId={bonusBuyId}
        record={record}
        onOpenArchiveDialog={() => setArchiveSessionDialogOpen(true)}
        onOpenEditDialog={() => setEditSessionDialogOpen(true)}
        onOpenWidgetDialog={() => setWidgetDialogOpen(true)}
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
      />
      <BonusBuySessionSlotsSection
        accountId={accountId}
        bonusBuyId={bonusBuyId}
        slots={slots}
      />
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
      <BonusBuyWidgetStyleDialog
        accountId={accountId}
        bonusBuyId={bonusBuyId}
        record={record}
        slots={slots}
        open={widgetDialogOpen}
        onClose={() => setWidgetDialogOpen(false)}
      />
    </PageStack>
  )
}
