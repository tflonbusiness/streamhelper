import { Grid, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { isPrizeSpinReadOnly } from '@/api/prize-spin'
import { PageHeader } from '@/components/PageHeader'
import { PrizeSpinDeactivateSessionDialog } from '@/components/prize-spin/session/PrizeSpinDeactivateSessionDialog'
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
import { usePrizeSpinSession } from '@/queries/use-prize-spin-session'

const PageStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(4),
}))

const ContentGrid = styled(Grid)({
  alignItems: 'stretch',
})

const MainColumnStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
}))

const SideColumnStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
}))

export const PrizeSpinSessionPage = () => {
  const { id } = useParams()
  const prizeSpinId = Number.parseInt(id ?? '', 10)
  const isValidId = Number.isFinite(prizeSpinId)
  const { user } = useAuth()

  const [archiveSessionDialogOpen, setArchiveSessionDialogOpen] = useState(false)
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)

  const {
    data: session,
    isLoading: loading,
    error: sessionError,
  } = usePrizeSpinSession(user?.accountId, isValidId ? prizeSpinId : Number.NaN)

  const record = session?.record ?? null
  const sectors = session?.sectors ?? []
  const wins = session?.wins ?? []
  const error = !isValidId
    ? 'Session not found'
    : sessionError instanceof Error
      ? sessionError.message
      : sessionError
        ? 'Could not load prize spin session'
        : null

  useSetBreadcrumbLabel(record ? `${record.title} #${record.id}` : null)

  if (loading) {
    return <PrizeSpinSessionLoadingState />
  }

  if (error || !record || user?.accountId === undefined) {
    return (
      <PrizeSpinSessionErrorState
        message={error ?? 'Session not found'}
      />
    )
  }

  const readOnly = isPrizeSpinReadOnly(record)
  const accountId = user.accountId

  return (
    <PageStack>
      <PageHeader
        title={prizeSpinModule.name}
        description={prizeSpinModule.description}
        icon={prizeSpinModule.icon}
        iconVariant={prizeSpinModule.iconVariant}
      />
      <PrizeSpinSessionHeaderSection
        accountId={accountId}
        prizeSpinId={prizeSpinId}
        record={record}
        wins={wins}
        onOpenArchiveDialog={() => setArchiveSessionDialogOpen(true)}
        onOpenDeactivateDialog={() => setDeactivateDialogOpen(true)}
      />
      <ContentGrid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <MainColumnStack>
            <PrizeSpinSessionSpinSection
              accountId={accountId}
              prizeSpinId={prizeSpinId}
              sectors={sectors}
              readOnly={readOnly}
            />
            <PrizeSpinSessionSectorsSection
              accountId={accountId}
              prizeSpinId={prizeSpinId}
              sectors={sectors}
              readOnly={readOnly}
            />
          </MainColumnStack>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <SideColumnStack>
            <PrizeSpinSessionStatsCard wins={wins} sectors={sectors} />
            <PrizeSpinSessionWinnersSection
              accountId={accountId}
              prizeSpinId={prizeSpinId}
              wins={wins}
              readOnly={readOnly}
            />
          </SideColumnStack>
        </Grid>
      </ContentGrid>
      <PrizeSpinSessionArchiveDialog
        accountId={accountId}
        prizeSpinId={prizeSpinId}
        record={record}
        open={archiveSessionDialogOpen}
        onClose={() => setArchiveSessionDialogOpen(false)}
      />
      <PrizeSpinDeactivateSessionDialog
        accountId={accountId}
        prizeSpinId={prizeSpinId}
        open={deactivateDialogOpen}
        onClose={() => setDeactivateDialogOpen(false)}
      />
    </PageStack>
  )
}
