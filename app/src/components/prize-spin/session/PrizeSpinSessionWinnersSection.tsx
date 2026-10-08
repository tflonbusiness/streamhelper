import { Button } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import ArchiveIcon from '@mui/icons-material/Archive'
import { useState } from 'react'
import type { PrizeSpinWin } from '@/api/prize-spin'
import { AppTable } from '@/components/AppTable'
import { SectionHeader, sectionTableIcon } from '@/components/SectionHeader'
import { PrizeSpinArchiveAllWinnersDialog } from '@/components/prize-spin/session/PrizeSpinArchiveAllWinnersDialog'
import { PrizeSpinWinnerExpandedDetails } from '@/components/prize-spin/session/PrizeSpinWinnerExpandedDetails'
import { buildPrizeSpinWinnerColumns } from '@/components/prize-spin/session/prizeSpinWinnerColumns'
import {
  StyledSessionScrollableCard,
  StyledSessionScrollableCardContent,
  StyledSessionSectionChrome,
  StyledSessionWinnersTableScrollBody,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { StatusAlert } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'
import { useDeletePrizeSpinWin } from '@/queries/use-prize-spin-session'

type PrizeSpinSessionWinnersSectionProps = {
  accountId: number
  prizeSpinId: number
  wins: PrizeSpinWin[]
  readOnly: boolean
}

export const PrizeSpinSessionWinnersSection = (
  props: PrizeSpinSessionWinnersSectionProps,
) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { showSuccess, showError } = useNotification()
  const [expandedWinnerIds, setExpandedWinnerIds] = useState<Set<number>>(
    new Set(),
  )
  const [archiveAllDialogOpen, setArchiveAllDialogOpen] = useState(false)

  const deleteWinMutation = useDeletePrizeSpinWin(
    props.accountId,
    props.prizeSpinId,
  )

  const handleCopyNick = async (win: PrizeSpinWin) => {
    try {
      await navigator.clipboard.writeText(win.participantNick)
      showSuccess(t('prizeSpin.winnerNickCopied'))
    } catch {
      showError(t('prizeSpin.couldNotCopyWinnerNick'))
    }
  }

  const handleDeleteWin = (winId: number) => {
    deleteWinMutation.mutate(winId, {
      onSuccess: () => showSuccess(t('prizeSpin.winnerRemoved')),
      onError: (error) => {
        showError(
          error instanceof Error ? error.message : t('prizeSpin.couldNotRemoveWinner'),
        )
      },
    })
  }

  const toggleWinnerExpanded = (winId: number) => {
    setExpandedWinnerIds((previous) => {
      const next = new Set(previous)
      if (next.has(winId)) {
        next.delete(winId)
      } else {
        next.add(winId)
      }
      return next
    })
  }

  const winnerColumns = buildPrizeSpinWinnerColumns(t, {
    theme,
    readOnly: props.readOnly,
    onCopyNick: (win) => void handleCopyNick(win),
    onDelete: handleDeleteWin,
  })

  return (
    <>
      <StyledSessionScrollableCard elevation={0}>
        <StyledSessionScrollableCardContent>
          <StyledSessionSectionChrome>
            <SectionHeader
              title={t('prizeSpin.winnersHistoryTitle', { count: props.wins.length })}
              description={t('prizeSpin.winnersHistoryDescription')}
              icon={sectionTableIcon}
              iconVariant="secondary"
              action={
                props.wins.length > 0 ? (
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    startIcon={<ArchiveIcon fontSize="small" aria-hidden />}
                    disabled={props.readOnly}
                    onClick={() => setArchiveAllDialogOpen(true)}
                  >
                    {t('prizeSpin.archiveAll')}
                  </Button>
                ) : undefined
              }
            />
          </StyledSessionSectionChrome>
          <StyledSessionWinnersTableScrollBody>
            {props.wins.length > 0 ? (
              <AppTable
                columns={winnerColumns}
                rows={props.wins}
                getRowKey={(win) => win.id}
                expandable={{
                  isExpanded: (win) => expandedWinnerIds.has(win.id),
                  onToggle: (win) => toggleWinnerExpanded(win.id),
                  ariaLabel: (win) =>
                    expandedWinnerIds.has(win.id)
                      ? `Collapse details for ${win.participantNick}`
                      : `Expand details for ${win.participantNick}`,
                  renderDetail: (win) => (
                    <PrizeSpinWinnerExpandedDetails win={win} />
                  ),
                }}
              />
            ) : (
              <StatusAlert tone="info">{t('prizeSpin.noWinners')}</StatusAlert>
            )}
          </StyledSessionWinnersTableScrollBody>
        </StyledSessionScrollableCardContent>
      </StyledSessionScrollableCard>

      <PrizeSpinArchiveAllWinnersDialog
        accountId={props.accountId}
        prizeSpinId={props.prizeSpinId}
        winnerCount={props.wins.length}
        open={archiveAllDialogOpen}
        onClose={() => setArchiveAllDialogOpen(false)}
      />
    </>
  )
}
