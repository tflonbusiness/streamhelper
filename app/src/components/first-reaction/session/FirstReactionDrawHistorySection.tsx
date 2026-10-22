import { Box, Button, Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import ArchiveIcon from '@mui/icons-material/Archive'
import HistoryIcon from '@mui/icons-material/History'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppTable } from '@/components/AppTable'
import { SectionHeader, sectionTableIcon } from '@/components/SectionHeader'
import { StatusAlert } from '@/components/StatusAlert'
import { FirstReactionArchiveAllDrawsDialog } from '@/components/first-reaction/session/FirstReactionArchiveAllDrawsDialog'
import { buildFirstReactionDrawHistoryColumns } from '@/components/first-reaction/session/firstReactionDrawHistoryColumns'
import {
  DEFAULT_FIRST_REACTION_DRAW_SORT,
  FIRST_REACTION_DRAW_HISTORY_PAGE_SIZE,
  toFirstReactionDrawListParams,
  type FirstReactionDrawSortField,
  type FirstReactionDrawSortState,
} from '@/components/first-reaction/session/first-reaction-draw-history-sort'
import {
  StyledSessionCard,
  StyledSessionCardContent,
  StyledSessionSectionChrome,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { useNotification } from '@/context/NotificationContext'
import {
  useArchiveFirstReactionDraw,
  useFirstReactionDraws,
} from '@/queries/use-first-reaction-session'

type FirstReactionDrawHistorySectionProps = {
  accountId: number
  firstReactionId: number
  readOnly: boolean
  pollWhileAccepting?: boolean
}

export function FirstReactionDrawHistorySection({
  accountId,
  firstReactionId,
  readOnly,
  pollWhileAccepting = false,
}: FirstReactionDrawHistorySectionProps) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const locale = i18n.language
  const { showSuccess, showError } = useNotification()
  const [archiveAllDialogOpen, setArchiveAllDialogOpen] = useState(false)

  const archiveDrawMutation = useArchiveFirstReactionDraw(
    accountId,
    firstReactionId,
  )

  const [sort, setSort] = useState<FirstReactionDrawSortState>(
    DEFAULT_FIRST_REACTION_DRAW_SORT,
  )
  const [page, setPage] = useState(1)

  const listParams = useMemo(
    () => toFirstReactionDrawListParams(page, sort),
    [page, sort],
  )

  const { data, isLoading, isFetching, error } = useFirstReactionDraws(
    accountId,
    firstReactionId,
    listParams,
    { pollWhileAccepting },
  )

  const draws = data?.draws ?? []
  const total = data?.total ?? 0
  const showInitialLoading = isLoading && !data

  useEffect(() => {
    if (!data) {
      return
    }
    const maxPage = Math.max(
      1,
      Math.ceil(data.total / FIRST_REACTION_DRAW_HISTORY_PAGE_SIZE) || 1,
    )
    if (page > maxPage) {
      setPage(maxPage)
    }
  }, [data, page])

  const handleSortField = useCallback((field: FirstReactionDrawSortField) => {
    setSort((previous) => {
      if (previous.field === field) {
        return {
          field,
          direction: previous.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return { field, direction: 'asc' }
    })
    setPage(1)
  }, [])

  const handleArchiveDraw = useCallback(
    (drawId: number) => {
      archiveDrawMutation.mutate(drawId, {
        onSuccess: () => showSuccess(t('firstReaction.drawRemoved')),
        onError: (error) => {
          showError(
            error instanceof Error
              ? error.message
              : t('firstReaction.couldNotRemoveDraw'),
          )
        },
      })
    },
    [archiveDrawMutation, showError, showSuccess, t],
  )

  const columns = useMemo(
    () =>
      buildFirstReactionDrawHistoryColumns({
        t,
        theme,
        locale,
        sort,
        onSortField: handleSortField,
        readOnly,
        onArchiveDraw: handleArchiveDraw,
      }),
    [handleArchiveDraw, handleSortField, locale, readOnly, sort, t, theme],
  )

  const archivableCount = draws.filter((draw) => draw.phase === 'closed').length

  return (
    <>
    <StyledSessionCard elevation={0}>
      <StyledSessionCardContent>
        <Stack spacing={2}>
          <StyledSessionSectionChrome>
            <SectionHeader
              title={t('firstReaction.drawHistoryTitle', { count: total })}
              description={t('firstReaction.drawHistoryDescription')}
              icon={total > 0 ? sectionTableIcon : HistoryIcon}
              iconVariant={total > 0 ? 'secondary' : 'info'}
              showDivider={false}
              action={
                archivableCount > 0 ? (
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    startIcon={<ArchiveIcon fontSize="small" aria-hidden />}
                    disabled={readOnly}
                    onClick={() => setArchiveAllDialogOpen(true)}
                  >
                    {t('firstReaction.archiveAllDraws')}
                  </Button>
                ) : undefined
              }
            />
          </StyledSessionSectionChrome>
          {error ? (
            <StatusAlert tone="error">
              {error instanceof Error
                ? error.message
                : t('firstReaction.couldNotLoadDrawHistory')}
            </StatusAlert>
          ) : null}
          {!error && total === 0 && !showInitialLoading ? (
            <StatusAlert tone="info">{t('firstReaction.noDraws')}</StatusAlert>
          ) : null}
          {!error && (total > 0 || showInitialLoading) ? (
            <Box sx={{ minWidth: 0, overflowX: 'auto' }}>
              <AppTable
                columns={columns}
                rows={draws}
                getRowKey={(draw) => draw.id}
                loading={showInitialLoading || isFetching}
                pagination={{
                  count: total,
                  page,
                  onPageChange: setPage,
                  rowsPerPage: FIRST_REACTION_DRAW_HISTORY_PAGE_SIZE,
                }}
              />
            </Box>
          ) : null}
        </Stack>
      </StyledSessionCardContent>
    </StyledSessionCard>
    <FirstReactionArchiveAllDrawsDialog
      accountId={accountId}
      firstReactionId={firstReactionId}
      drawCount={archivableCount}
      open={archiveAllDialogOpen}
      onClose={() => setArchiveAllDialogOpen(false)}
    />
    </>
  )
}
