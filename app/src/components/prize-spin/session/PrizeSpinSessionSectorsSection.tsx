import { Button, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import AddIcon from '@mui/icons-material/Add'
import BalanceIcon from '@mui/icons-material/Balance'
import PieChartIcon from '@mui/icons-material/PieChart'
import { styled } from '@mui/material/styles'
import { useCallback, useMemo, useState } from 'react'
import type { PrizeSpinSector } from '@/api/prize-spin'
import { AppTable } from '@/components/AppTable'
import { SectionHeader } from '@/components/SectionHeader'
import { PrizeSpinAddSectorDialog } from '@/components/prize-spin/session/PrizeSpinAddSectorDialog'
import { PrizeSpinSectorInlineEditProvider } from '@/components/prize-spin/session/PrizeSpinSectorInlineEdit'
import { buildPrizeSpinSectorColumns } from '@/components/prize-spin/session/prizeSpinSectorColumns'
import {
  buildPrizeSpinSectorsSnapshot,
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
  canMutate?: boolean
  canAddSector?: boolean
}

const SectionActions = styled(Stack)({
  flexShrink: 0,
})

const DistributeButton = styled(Button)({
  flexShrink: 0,
  minWidth: 168,
})

type WinPercentTotalTone = 'complete' | 'under' | 'over'

const WinPercentTotal = styled(Typography, {
  shouldForwardProp: (prop) => prop !== '$tone',
})<{ $tone: WinPercentTotalTone }>(({ theme, $tone }) => ({
  marginBottom: theme.spacing(1.5),
  fontWeight: 700,
  fontSize: '0.9375rem',
  letterSpacing: '-0.01em',
  fontVariantNumeric: 'tabular-nums',
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
  const { t } = useTranslation()
  const { showSuccess, showError } = useNotification()
  const [addDialogOpen, setAddDialogOpen] = useState(false)

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

  const handleDeleteSector = useCallback(
    (sectorId: number) => {
      deleteSectorMutation.mutate(sectorId, {
        onSuccess: () => showSuccess(t('prizeSpin.sectorRemoved')),
        onError: (error) => {
          showError(
            error instanceof Error
              ? error.message
              : t('prizeSpin.couldNotDeleteSector'),
          )
        },
      })
    },
    [deleteSectorMutation, showError, showSuccess, t],
  )

  const sectorsSnapshot = useMemo(
    () => buildPrizeSpinSectorsSnapshot(props.sectors),
    [props.sectors],
  )

  const handleDistributeSectorsEqually = () => {
    if (props.sectors.length === 0) {
      return
    }

    distributeSectorsMutation.mutate(undefined, {
      onSuccess: () => showSuccess(t('prizeSpin.sectorWeightsSplit')),
      onError: (error) => {
        showError(
          error instanceof Error
            ? error.message
            : t('prizeSpin.couldNotDistributeWeights'),
        )
      },
    })
  }

  const sectorColumns = useMemo(
    () =>
      buildPrizeSpinSectorColumns(t, {
        readOnly: props.readOnly || props.canMutate === false,
        deleteDisabled: props.readOnly,
        onDelete: handleDeleteSector,
      }),
    [handleDeleteSector, props.canMutate, props.readOnly, t],
  )

  return (
    <>
      <StyledSessionCard elevation={0}>
        <StyledSessionCardContent>
          <SectionHeader
            title={t('prizeSpin.sectorsTitle', { count: props.sectors.length })}
            description={t('prizeSpin.sectorsDescription')}
            icon={PieChartIcon}
            iconVariant="purple"
            showDivider={false}
            action={
              <SectionActions direction="row" spacing={1}>
                <DistributeButton
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<BalanceIcon fontSize="small" aria-hidden />}
                  loading={distributeSectorsMutation.isPending}
                  loadingPosition="start"
                  disabled={
                    props.readOnly ||
                    props.canMutate === false ||
                    props.sectors.length === 0 ||
                    distributeSectorsMutation.isPending
                  }
                  onClick={() => void handleDistributeSectorsEqually()}
                >
                  {t('prizeSpin.split100')}
                </DistributeButton>
                <Button
                  type="button"
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon fontSize="small" aria-hidden />}
                  disabled={
                    props.readOnly ||
                    props.canAddSector === false
                  }
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
            <PrizeSpinSectorInlineEditProvider
              accountId={props.accountId}
              prizeSpinId={props.prizeSpinId}
              existingTotalWinPercent={totalWinPercent}
              sectorsSnapshot={sectorsSnapshot}
              readOnly={props.readOnly || props.canMutate === false}
            >
              <AppTable
                columns={sectorColumns}
                rows={props.sectors}
                getRowKey={(sector) => sector.id}
              />
            </PrizeSpinSectorInlineEditProvider>
          ) : (
            <StatusAlert tone="info">
              {t('prizeSpin.sectorsEmptyHint')}
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
    </>
  )
}
