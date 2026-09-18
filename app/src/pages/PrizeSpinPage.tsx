import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useTheme, alpha, type Theme } from '@mui/material/styles'
import { SquareRounded  as SquareRoundedIcon } from '@mui/icons-material'
import {
  Archive,
  ArrowRight,
  ExternalLink,
  Link2,
  Monitor,
  Plus,
  Radio,
  RotateCw,
  Settings2,
} from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  isPrizeSpinArchived,
  isPrizeSpinLive,
  type PrizeSpinArchivedFilter,
  type PrizeSpinRecord,
} from '@/api/prize-spin'
import { AppTable, type AppTableColumn } from '@/components/AppTable'
import { LiveStatusChip } from '@/components/LiveStatusChip'
import { PageHeader } from '@/components/PageHeader'
import { SectionHeader } from '@/components/SectionHeader'
import { StatusAlert } from '@/components/StatusAlert'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import {
  useArchivePrizeSpin,
  useCreatePrizeSpin,
  useDeactivatePrizeSpin,
  useGoLivePrizeSpin,
  usePatchPrizeSpinWidget,
  usePrizeSpinWidget,
  usePrizeSpins,
} from '@/queries/use-prize-spins'
import {
  buildPrizeSpinObsOverlayUrl,
  buildPrizeSpinOverlayPath,
} from '@/lib/prize-spin-overlay-url'
import { cardSx, inputFieldSx, mutedChipSx } from '@/theme/colors'

const DEFAULT_TITLE = 'Prize Spin'
const HISTORY_PAGE_SIZE = 10

function historyEmptyMessage(filter: PrizeSpinArchivedFilter): string {
  if (filter === 'true') {
    return 'No archived sessions'
  }

  return 'No prize spin sessions yet'
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function RecordExpandedDetails({ record }: { record: PrizeSpinRecord }) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: 'text.secondary',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            mb: 0.5,
          }}
        >
          Created by
        </Typography>
        <Typography variant="body2">{record.createdByName}</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: 'text.secondary',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            mb: 0.5,
          }}
        >
          Created
        </Typography>
        <Typography variant="body2">{formatDateTime(record.createdAt)}</Typography>
      </Grid>
    </Grid>
  )
}

function liveSessionRowSx(theme: Theme) {
  return {
    bgcolor: alpha(theme.palette.warning.main, 0.08),
    boxShadow: `inset 0 0 0 2px ${alpha(theme.palette.warning.main, 0.55)}`,
    '&:hover': {
      bgcolor: alpha(theme.palette.warning.main, 0.12),
    },
  }
}

function recordStatusChip(record: PrizeSpinRecord, theme: Theme) {
  if (isPrizeSpinArchived(record)) {
    return (
      <Chip label="Archived" size="small" sx={mutedChipSx(theme)} />
    )
  }

  if (isPrizeSpinLive(record)) {
    return <LiveStatusChip />
  }

  return <Chip label="Off Air" size="small" sx={mutedChipSx(theme)} />
}

export function PrizeSpinPage() {
  const theme = useTheme()
  const { user } = useAuth()
  const { showSuccess, showError } = useNotification()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [title, setTitle] = useState(DEFAULT_TITLE)
  const [createError, setCreateError] = useState<string | null>(null)
  const [expandedRecordIds, setExpandedRecordIds] = useState<Set<number>>(
    new Set(),
  )
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false)
  const [widgetWidth, setWidgetWidth] = useState('500')
  const [widgetHeight, setWidgetHeight] = useState('500')
  const [widgetEditError, setWidgetEditError] = useState<string | null>(null)
  const [liveActionError, setLiveActionError] = useState<string | null>(null)
  const [archiveDialogRecord, setArchiveDialogRecord] =
    useState<PrizeSpinRecord | null>(null)
  const [archiveError, setArchiveError] = useState<string | null>(null)
  const [archivedFilter, setArchivedFilter] =
    useState<PrizeSpinArchivedFilter>('false')
  const [recordsPage, setRecordsPage] = useState(1)

  const listParams = {
    archived: archivedFilter,
    page: recordsPage,
    limit: HISTORY_PAGE_SIZE,
  }

  const {
    data: recordsResult,
    isLoading: loadingRecords,
    error: recordsQueryError,
  } = usePrizeSpins(user?.accountId, listParams)

  const createMutation = useCreatePrizeSpin(user?.accountId)
  const goLiveMutation = useGoLivePrizeSpin(user?.accountId)
  const deactivateMutation = useDeactivatePrizeSpin(user?.accountId)
  const archiveMutation = useArchivePrizeSpin(user?.accountId)
  const patchWidgetMutation = usePatchPrizeSpinWidget(user?.accountId)

  const {
    data: widgetSettings,
    isLoading: isDialogLoadingWidget,
    error: widgetLoadError,
  } = usePrizeSpinWidget(user?.accountId, widgetDialogOpen)

  const records = recordsResult?.records ?? []
  const recordsTotal =
    typeof recordsResult?.total === 'number'
      ? recordsResult.total
      : records.length
  const recordsError =
    recordsQueryError instanceof Error
      ? recordsQueryError.message
      : recordsQueryError
        ? 'Could not load prize spin history'
        : null

  const liveActionRecordId =
    goLiveMutation.isPending
      ? goLiveMutation.variables
      : deactivateMutation.isPending
        ? deactivateMutation.variables
        : archiveMutation.isPending
          ? archiveMutation.variables
          : null

  const overlayHref = user?.ucid ? buildPrizeSpinOverlayPath(user.ucid) : null
  const obsOverlayUrl = user?.ucid ? buildPrizeSpinObsOverlayUrl(user.ucid) : null

  useEffect(() => {
    if (widgetSettings) {
      setWidgetWidth(String(widgetSettings.width))
      setWidgetHeight(String(widgetSettings.height))
    }
  }, [widgetSettings])

  useEffect(() => {
    if (
      recordsResult &&
      recordsResult.records.length === 0 &&
      recordsResult.total > 0 &&
      recordsPage > 1
    ) {
      setRecordsPage(recordsPage - 1)
    }
  }, [recordsResult, recordsPage])

  function resetCreateForm() {
    setTitle(DEFAULT_TITLE)
    setCreateError(null)
  }

  function handleCreateDialogChange(open: boolean) {
    setCreateDialogOpen(open)
    if (!open) {
      resetCreateForm()
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user?.accountId) {
      return
    }

    setCreateError(null)

    try {
      await createMutation.mutateAsync(title)
      setCreateDialogOpen(false)
      resetCreateForm()
      setRecordsPage(1)
      showSuccess('Prize spin session created.')
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : 'Could not create prize spin',
      )
    }
  }

  async function handleCopyObsLink() {
    if (!obsOverlayUrl) {
      return
    }

    try {
      await navigator.clipboard.writeText(obsOverlayUrl)
      showSuccess('OBS link copied.')
    } catch {
      showError('Could not copy OBS link.')
    }
  }

  function openWidgetSettingsDialog() {
    if (!user?.accountId) {
      return
    }

    setWidgetDialogOpen(true)
    setWidgetEditError(null)
  }

  async function handleSaveWidgetSize() {
    if (!user?.accountId) {
      return
    }

    const width = Number.parseInt(widgetWidth, 10)
    const height = Number.parseInt(widgetHeight, 10)

    if (!Number.isFinite(width) || width < 200 || width > 2400) {
      setWidgetEditError('Width must be between 200 and 2400 px.')
      return
    }

    if (!Number.isFinite(height) || height < 200 || height > 2400) {
      setWidgetEditError('Height must be between 200 and 2400 px.')
      return
    }

    setWidgetEditError(null)

    try {
      await patchWidgetMutation.mutateAsync({ width, height })
      setWidgetDialogOpen(false)
      showSuccess('Widget settings saved')
    } catch (error) {
      setWidgetEditError(
        error instanceof Error
          ? error.message
          : 'Could not save widget settings',
      )
    }
  }

  async function handleGoLive(record: PrizeSpinRecord) {
    if (!user?.accountId) {
      return
    }

    setLiveActionError(null)

    try {
      await goLiveMutation.mutateAsync(record.id)
      showSuccess('Session is now live.')
    } catch (error) {
      setLiveActionError(
        error instanceof Error ? error.message : 'Could not go live',
      )
    }
  }

  async function handleDeactivate(record: PrizeSpinRecord) {
    if (!user?.accountId) {
      return
    }

    setLiveActionError(null)

    try {
      await deactivateMutation.mutateAsync(record.id)
      showSuccess('Session taken off air.')
    } catch (error) {
      setLiveActionError(
        error instanceof Error ? error.message : 'Could not deactivate session',
      )
    }
  }

  function openArchiveDialog(record: PrizeSpinRecord) {
    setArchiveError(null)
    setArchiveDialogRecord(record)
  }

  function closeArchiveDialog() {
    if (archiveMutation.isPending) {
      return
    }
    setArchiveDialogRecord(null)
    setArchiveError(null)
  }

  async function handleArchiveSession() {
    if (!user?.accountId || !archiveDialogRecord) {
      return
    }

    const record = archiveDialogRecord
    setArchiveError(null)
    setLiveActionError(null)

    try {
      await archiveMutation.mutateAsync(record.id)
      setArchiveDialogRecord(null)
      showSuccess('Session archived.')
    } catch (error) {
      setArchiveError(
        error instanceof Error ? error.message : 'Could not archive session',
      )
    }
  }

  function toggleRecordExpanded(recordId: number) {
    setExpandedRecordIds((previous) => {
      const next = new Set(previous)
      if (next.has(recordId)) {
        next.delete(recordId)
      } else {
        next.add(recordId)
      }
      return next
    })
  }

  const recordColumns: AppTableColumn<PrizeSpinRecord>[] = [
    {
      id: 'title',
      header: 'Title',
      width: '100%',
      sx: {
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      render: (record) => (
        <Typography
          component="span"
          variant="body2"
          sx={{
            fontWeight: 500,
            color: isPrizeSpinArchived(record)
              ? 'text.secondary'
              : 'text.primary',
          }}
        >
          {record.title}
        </Typography>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      width: 108,
      minWidth: 108,
      sx: { px: 1.5, whiteSpace: 'nowrap' },
      render: (record) =>
        recordStatusChip(record, theme),
    },
    {
      id: 'action',
      header: '',
      align: 'right',
      width: 128,
      minWidth: 128,
      sx: { px: 1, whiteSpace: 'nowrap' },
      render: (record) => {
        const isUpdating = liveActionRecordId === record.id
        const readOnly = isPrizeSpinArchived(record)

        return (
          <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
            {!readOnly && isPrizeSpinLive(record) ? (
              <Tooltip title="Off Air">
                <span>
                  <IconButton
                    type="button"
                    aria-label={`Take ${record.title} off Air`}
                    size="small"
                    disabled={isUpdating}
                    onClick={() => void handleDeactivate(record)}
                    sx={{
                      borderRadius: 1,
                      width: 28,
                      height: 28,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.error.main, 0.4),
                      color: theme.palette.error.main,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        borderColor: theme.palette.error.main,
                      },
                    }}
                  >
                    <SquareRoundedIcon sx={{ fontSize: 14 }} aria-hidden />
                  </IconButton>
                </span>
              </Tooltip>
            ) : null}
            {!readOnly && !isPrizeSpinLive(record) ? (
              <Tooltip title="Go live">
                <span>
                  <IconButton
                    type="button"
                    aria-label={`Go live with ${record.title}`}
                    size="small"
                    disabled={isUpdating}
                    onClick={() => void handleGoLive(record)}
                    sx={{
                      borderRadius: 1,
                      width: 28,
                      height: 28,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.success.main, 0.4),
                      color: theme.palette.success.light,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        borderColor: theme.palette.success.main,
                      },
                    }}
                  >
                    <Radio size={14} aria-hidden />
                  </IconButton>
                </span>
              </Tooltip>
            ) : null}
            <Tooltip title="Archive">
              <span>
                <IconButton
                  type="button"
                  aria-label={`Archive ${record.title}`}
                  size="small"
                  disabled={readOnly || isUpdating}
                  onClick={() => openArchiveDialog(record)}
                  sx={{
                    borderRadius: 1,
                    width: 28,
                    height: 28,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.warning.main, 0.4),
                    color: theme.palette.warning.main,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      borderColor: theme.palette.warning.main,
                    },
                  }}
                >
                  <Archive size={14} aria-hidden />
                </IconButton>
              </span>
            </Tooltip>
            <IconButton
              component={Link}
              to={`/prize-spin/${record.id}`}
              aria-label={`Open ${record.title}`}
              size="small"
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: 1,
                width: 28,
                height: 28,
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              <ArrowRight size={14} aria-hidden />
            </IconButton>
          </Stack>
        )
      },
    },
  ]

  return (
    <Stack spacing={4}>
      <PageHeader
        title="Prize Spin"
        description="Weighted prize wheel for your stream"
        icon={RotateCw}
        iconVariant="purple"
      />

      <Card elevation={0} sx={cardSx}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <SectionHeader
            title="Stream Widget"
            description="OBS overlay settings and links for your live prize spin session"
            icon={Monitor}
            iconVariant="info"
            action={
              user?.accountId ? (
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<Settings2 size={16} aria-hidden />}
                  onClick={() => void openWidgetSettingsDialog()}
                >
                  Widget settings
                </Button>
              ) : null
            }
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {overlayHref ? (
              <Button
                component={Link}
                to={overlayHref}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                startIcon={<ExternalLink size={16} aria-hidden />}
              >
                Open overlay
              </Button>
            ) : (
              <Button
                type="button"
                variant="outlined"
                startIcon={<ExternalLink size={16} aria-hidden />}
                disabled
              >
                Open overlay
              </Button>
            )}
            <Button
              type="button"
              variant="outlined"
              startIcon={<Link2 size={16} aria-hidden />}
              disabled={!obsOverlayUrl}
              onClick={() => void handleCopyObsLink()}
            >
              OBS link
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0} sx={cardSx}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <SectionHeader
            title="History"
            description="Prize spin sessions for this account"
            icon={RotateCw}
            iconVariant="secondary"
            action={
              user?.accountId ? (
                <Button
                  type="button"
                  variant="contained"
                  startIcon={<Plus size={16} aria-hidden />}
                  onClick={() => {
                    resetCreateForm()
                    setCreateDialogOpen(true)
                  }}
                >
                  New
                </Button>
              ) : null
            }
          />

          <Stack spacing={2}>
            {loadingRecords ? (
              <Stack spacing={1.5}>
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
              </Stack>
            ) : null}
            {recordsError ? (
              <StatusAlert tone="error">{recordsError}</StatusAlert>
            ) : null}
            {liveActionError ? (
              <StatusAlert tone="error">{liveActionError}</StatusAlert>
            ) : null}
            {!loadingRecords && !recordsError ? (
              <AppTable
                columns={recordColumns}
                rows={records}
                getRowKey={(record) => record.id}
                emptyMessage={historyEmptyMessage(archivedFilter)}
                toolbar={
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel id="prize-spin-archived-filter-label">
                      Show
                    </InputLabel>
                    <Select
                      labelId="prize-spin-archived-filter-label"
                      label="Show"
                      value={archivedFilter}
                      onChange={(event) => {
                        setArchivedFilter(
                          event.target.value as PrizeSpinArchivedFilter,
                        )
                        setRecordsPage(1)
                      }}
                      sx={inputFieldSx}
                    >
                      <MenuItem value="false">Active</MenuItem>
                      <MenuItem value="true">Archived</MenuItem>
                      <MenuItem value="all">All</MenuItem>
                    </Select>
                  </FormControl>
                }
                getRowSx={(record) =>
                  isPrizeSpinLive(record)
                    ? liveSessionRowSx(theme)
                    : undefined
                }
                pagination={{
                  count: recordsTotal,
                  page: recordsPage,
                  onPageChange: setRecordsPage,
                  rowsPerPage: HISTORY_PAGE_SIZE,
                }}
                expandable={{
                  isExpanded: (record) => expandedRecordIds.has(record.id),
                  onToggle: (record) => toggleRecordExpanded(record.id),
                  ariaLabel: (record) =>
                    expandedRecordIds.has(record.id)
                      ? `Collapse details for ${record.title}`
                      : `Expand details for ${record.title}`,
                  renderDetail: (record) => (
                    <RecordExpandedDetails record={record} />
                  ),
                }}
              />
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      <Dialog
        open={widgetDialogOpen}
        onClose={() => setWidgetDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Widget settings</DialogTitle>
        <DialogContent>
          {isDialogLoadingWidget ? (
            <Typography sx={{ py: 2, color: 'text.secondary' }}>
              Loading settings…
            </Typography>
          ) : (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Width"
                type="number"
                value={widgetWidth}
                onChange={(event) => setWidgetWidth(event.target.value)}
                slotProps={{
                  htmlInput: { min: 200, max: 2400, step: 1 },
                }}
                fullWidth
                size="small"
                sx={inputFieldSx}
              />
              <TextField
                label="Height"
                type="number"
                value={widgetHeight}
                onChange={(event) => setWidgetHeight(event.target.value)}
                slotProps={{
                  htmlInput: { min: 200, max: 2400, step: 1 },
                }}
                fullWidth
                size="small"
                sx={inputFieldSx}
              />
              {widgetLoadError ? (
                <StatusAlert tone="error">
                  {widgetLoadError instanceof Error
                    ? widgetLoadError.message
                    : 'Could not load widget settings'}
                </StatusAlert>
              ) : null}
              {widgetEditError ? (
                <StatusAlert tone="error">{widgetEditError}</StatusAlert>
              ) : null}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => setWidgetDialogOpen(false)}
            disabled={patchWidgetMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={() => void handleSaveWidgetSize()}
            disabled={isDialogLoadingWidget || patchWidgetMutation.isPending}
          >
            {patchWidgetMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={archiveDialogRecord !== null}
        onClose={closeArchiveDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Archive session?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {archiveDialogRecord?.title} will be removed from the active list.
            Archived sessions can be opened for review but not edited.
          </Typography>
          {archiveError ? (
            <StatusAlert tone="error" sx={{ mt: 2 }}>
              {archiveError}
            </StatusAlert>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={closeArchiveDialog}
            disabled={archiveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="contained"
            color="warning"
            onClick={() => void handleArchiveSession()}
            disabled={archiveMutation.isPending}
          >
            {archiveMutation.isPending ? 'Archiving…' : 'Archive'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={createDialogOpen}
        onClose={() => handleCreateDialogChange(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New Prize Spin</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create a prize spin session with a title for your stream.
          </Typography>
          <Box
            component="form"
            id="prize-spin-create-form"
            onSubmit={handleCreate}
          >
            <Stack spacing={2.5}>
              <TextField
                id="prize-spin-title"
                label="Title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                slotProps={{ htmlInput: { maxLength: 200 } }}
                autoFocus
                fullWidth
                size="small"
                sx={inputFieldSx}
              />
              {createError ? (
                <StatusAlert tone="error">{createError}</StatusAlert>
              ) : null}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => handleCreateDialogChange(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="prize-spin-create-form"
            variant="contained"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
