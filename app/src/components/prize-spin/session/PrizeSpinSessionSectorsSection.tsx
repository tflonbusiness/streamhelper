import { Button, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import BalanceIcon from '@mui/icons-material/Balance'
import PieChartIcon from '@mui/icons-material/PieChart'
import { styled } from '@mui/material/styles'
import { useMemo, useState } from 'react'
import type { PrizeSpinSector } from '@/api/prize-spin'
import { AppTable } from '@/components/AppTable'
import { SectionHeader } from '@/components/SectionHeader'
import { PrizeSpinAddSectorDialog } from '@/components/prize-spin/session/PrizeSpinAddSectorDialog'
import { PrizeSpinEditSectorDialog } from '@/components/prize-spin/session/PrizeSpinEditSectorDialog'
import { buildPrizeSpinSectorColumns } from '@/components/prize-spin/session/prizeSpinSectorColumns'
import {
  formatActiveWinPercentTotalLabel,
  isCompleteWinPercentTotal,
  sumWinPercent,
} from '@/components/prize-spin/session/prize-spin-session-utils'
import {
  StyledSessionCard,
  StyledSessionCardContent,
  StyledSectionDivider,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { StatusAlert } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'
import {
  useDeletePrizeSpinSector,
  useDistributePrizeSpinSectors,
} from '@/queries/use-prize-spin-session'

type PrizeSpinSessionSectorsSectionProps = {
  accountId: number
  prizeSpinId: number
  sectors: PrizeSpinSector[]
  readOnly: boolean
}

const SectionActions = styled(Stack)({
  flexShrink: 0,
})

type WinPercentTotalTone = 'complete' | 'under' | 'over'

const WinPercentTotal = styled(Typography, {
  shouldForwardProp: (prop) => prop !== '$tone',
})<{ $tone: WinPercentTotalTone }>(({ theme, $tone }) => ({
  marginBottom: theme.spacing(1.5),
  fontWeight: 700,
  fontSize: '0.9375rem',
  letterSpacing: '-0.01em',
  color:
    $tone === 'complete'
      ? theme.palette.success.main
      : $tone === 'under'
        ? theme.palette.error.main
        : theme.palette.warning.main,
}))

export const PrizeSpinSessionSectorsSection = (
  props: PrizeSpinSessionSectorsSectionProps,
) => {
  const { showSuccess, showError } = useNotification()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editSector, setEditSector] = useState<PrizeSpinSector | null>(null)

  const deleteSectorMutation = useDeletePrizeSpinSector(
    props.accountId,
    props.prizeSpinId,
  )
  const distributeSectorsMutation = useDistributePrizeSpinSectors(
    props.accountId,
    props.prizeSpinId,
  )

  const totalWinPercent = useMemo(
    () => sumWinPercent(props.sectors),
    [props.sectors],
  )
  const winPercentTotalTone: WinPercentTotalTone = isCompleteWinPercentTotal(
    totalWinPercent,
  )
    ? 'complete'
    : Number(totalWinPercent.toFixed(2)) < 100
      ? 'under'
      : 'over'

  const handleDeleteSector = (sectorId: number) => {
    deleteSectorMutation.mutate(sectorId, {
      onSuccess: () => showSuccess('Sector removed.'),
      onError: (error) => {
        showError(
          error instanceof Error ? error.message : 'Could not delete sector',
        )
      },
    })
  }

  const handleDistributeSectorsEqually = () => {
    if (props.sectors.length === 0) {
      return
    }

    distributeSectorsMutation.mutate(undefined, {
      onSuccess: () => showSuccess('Sector weights split evenly to 100%.'),
      onError: (error) => {
        showError(
          error instanceof Error
            ? error.message
            : 'Could not distribute sector weights',
        )
      },
    })
  }

  const sectorColumns = buildPrizeSpinSectorColumns({
    readOnly: props.readOnly,
    onEdit: setEditSector,
    onDelete: handleDeleteSector,
  })

  return (
    <>
      <StyledSessionCard elevation={0}>
        <StyledSessionCardContent>
          <SectionHeader
            title={`Wheel sectors (${props.sectors.length})`}
            description="Labels, colors, and win weights — total must equal 100%"
            icon={PieChartIcon}
            iconVariant="purple"
            showDivider={false}
            action={
              <SectionActions direction="row" spacing={1}>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<BalanceIcon fontSize="small" aria-hidden />}
                  disabled={
                    props.readOnly ||
                    props.sectors.length === 0 ||
                    distributeSectorsMutation.isPending
                  }
                  onClick={() => void handleDistributeSectorsEqually()}
                >
                  {distributeSectorsMutation.isPending
                    ? 'Splitting…'
                    : 'Split 100%'}
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon fontSize="small" aria-hidden />}
                  disabled={props.readOnly}
                  onClick={() => setAddDialogOpen(true)}
                >
                  Add sector
                </Button>
              </SectionActions>
            }
          />
          {props.sectors.length > 0 ? (
            <WinPercentTotal variant="body1" $tone={winPercentTotalTone}>
              {formatActiveWinPercentTotalLabel(totalWinPercent)}
            </WinPercentTotal>
          ) : null}
          <StyledSectionDivider />
          {props.sectors.length > 0 ? (
            <AppTable
              columns={sectorColumns}
              rows={props.sectors}
              getRowKey={(sector) => sector.id}
            />
          ) : (
            <StatusAlert tone="info">
              No sectors yet. Use Add sector to create at least two.
            </StatusAlert>
          )}
        </StyledSessionCardContent>
      </StyledSessionCard>

      <PrizeSpinAddSectorDialog
        accountId={props.accountId}
        prizeSpinId={props.prizeSpinId}
        existingTotalWinPercent={totalWinPercent}
        nextColorIndex={props.sectors.length}
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
      />
      <PrizeSpinEditSectorDialog
        accountId={props.accountId}
        prizeSpinId={props.prizeSpinId}
        existingTotalWinPercent={totalWinPercent}
        sector={editSector}
        onClose={() => setEditSector(null)}
      />
    </>
  )
}
