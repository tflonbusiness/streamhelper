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
  Grid,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useTheme, alpha, type Theme } from '@mui/material/styles'
import {
  ArrowRight,
  CircleStop,
  ExternalLink,
  Link2,
  Monitor,
  Plus,
  Radio,
  RotateCw,
  Settings2,
} from 'lucide-react'
import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createPrizeSpin,
  deactivatePrizeSpin,
  fetchPrizeSpinWidget,
  fetchPrizeSpins,
  goLivePrizeSpin,
  patchPrizeSpinWidget,
  type PrizeSpinRecord,
} from '@/api/prize-spin'
import { AppTable, type AppTableColumn } from '@/components/AppTable'
import { LiveStatusChip } from '@/components/LiveStatusChip'
import { PageHeader } from '@/components/PageHeader'
import { SectionHeader } from '@/components/SectionHeader'
import { StatusAlert } from '@/components/StatusAlert'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import { cardSx, inputFieldSx, mutedChipSx } from '@/theme/colors'

const DEFAULT_TITLE = 'Prize Spin'

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

function recordStatusChip(isActive: boolean, theme: Theme) {
  if (isActive) {
    return <LiveStatusChip />
  }

  return (
    <Chip label="Off air" size="small" sx={mutedChipSx(theme)} />
  )
}

export function PrizeSpinPage() {
  const theme = useTheme()
  const { user } = useAuth()
  const { showSuccess } = useNotification()
  const [records, setRecords] = useState<PrizeSpinRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(true)
  const [recordsError, setRecordsError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [title, setTitle] = useState(DEFAULT_TITLE)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [expandedRecordIds, setExpandedRecordIds] = useState<Set<number>>(
    new Set(),
  )
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false)
  const [widgetWidth, setWidgetWidth] = useState('500')
  const [widgetHeight, setWidgetHeight] = useState('500')
  const [widgetEditError, setWidgetEditError] = useState<string | null>(null)
  const [isSavingWidget, setIsSavingWidget] = useState(false)
  const [isDialogLoadingWidget, setIsDialogLoadingWidget] = useState(false)
  const [liveActionRecordId, setLiveActionRecordId] = useState<number | null>(
    null,
  )
  const [liveActionError, setLiveActionError] = useState<string | null>(null)

  const overlayHref = user?.channelSlug
    ? `/prize-spin/widget/${user.channelSlug}`
    : null

  const loadRecords = useCallback(async () => {
    if (!user?.accountId) {
      return
    }

    setLoadingRecords(true)
    setRecordsError(null)

    try {
      const rows = await fetchPrizeSpins(user.accountId)
      setRecords(rows)
    } catch (error) {
      setRecordsError(
        error instanceof Error
          ? error.message
          : 'Could not load prize spin history',
      )
    } finally {
      setLoadingRecords(false)
    }
  }, [user?.accountId])

  useEffect(() => {
    void loadRecords()
  }, [loadRecords])

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

    setIsCreating(true)
    setCreateError(null)

    try {
      await createPrizeSpin(user.accountId, title)
      setCreateDialogOpen(false)
      resetCreateForm()
      await loadRecords()
      showSuccess('Prize spin session created.')
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : 'Could not create prize spin',
      )
    } finally {
      setIsCreating(false)
    }
  }

  function showStub(message: string) {
    showSuccess(message)
  }

  async function openWidgetSettingsDialog() {
    if (!user?.accountId) {
      return
    }

    setWidgetDialogOpen(true)
    setWidgetEditError(null)
    setIsDialogLoadingWidget(true)

    try {
      const settings = await fetchPrizeSpinWidget(user.accountId)
      setWidgetWidth(String(settings.width))
      setWidgetHeight(String(settings.height))
    } catch (error) {
      setWidgetEditError(
        error instanceof Error
          ? error.message
          : 'Could not load widget settings',
      )
    } finally {
      setIsDialogLoadingWidget(false)
    }
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

    setIsSavingWidget(true)
    setWidgetEditError(null)

    try {
      await patchPrizeSpinWidget(user.accountId, { width, height })
      setWidgetDialogOpen(false)
      showSuccess('Widget settings saved')
    } catch (error) {
      setWidgetEditError(
        error instanceof Error
          ? error.message
          : 'Could not save widget settings',
      )
    } finally {
      setIsSavingWidget(false)
    }
  }

  async function handleGoLive(record: PrizeSpinRecord) {
    if (!user?.accountId) {
      return
    }

    setLiveActionRecordId(record.id)
    setLiveActionError(null)

    try {
      await goLivePrizeSpin(user.accountId, record.id)
      setRecords((previous) =>
        previous.map((row) => ({
          ...row,
          isActive: row.id === record.id,
        })),
      )
      showSuccess('Session is now live.')
    } catch (error) {
      setLiveActionError(
        error instanceof Error ? error.message : 'Could not go live',
      )
    } finally {
      setLiveActionRecordId(null)
    }
  }

  async function handleDeactivate(record: PrizeSpinRecord) {
    if (!user?.accountId) {
      return
    }

    setLiveActionRecordId(record.id)
    setLiveActionError(null)

    try {
      await deactivatePrizeSpin(user.accountId, record.id)
      setRecords((previous) =>
        previous.map((row) =>
          row.id === record.id ? { ...row, isActive: false } : row,
        ),
      )
      showSuccess('Session taken off air.')
    } catch (error) {
      setLiveActionError(
        error instanceof Error ? error.message : 'Could not deactivate session',
      )
    } finally {
      setLiveActionRecordId(null)
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
        fontWeight: 500,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      render: (record) => record.title,
    },
    {
      id: 'status',
      header: 'Status',
      width: 100,
      minWidth: 100,
      sx: { px: 1.5, whiteSpace: 'nowrap' },
      render: (record) =>
        recordStatusChip(record.isActive, theme),
    },
    {
      id: 'action',
      header: '',
      align: 'right',
      width: 96,
      minWidth: 96,
      sx: { px: 1, whiteSpace: 'nowrap' },
      render: (record) => {
        const isUpdating = liveActionRecordId === record.id

        return (
          <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
            {record.isActive ? (
              <Tooltip title="Deactivate">
                <span>
                  <IconButton
                    type="button"
                    aria-label={`Deactivate ${record.title}`}
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
                    <CircleStop size={14} aria-hidden />
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
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
            )}
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
            title="Stream widget"
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
              onClick={() => showStub('Coming soon')}
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
            {!loadingRecords && records.length > 0 ? (
              <AppTable
                columns={recordColumns}
                rows={records}
                getRowKey={(record) => record.id}
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
            {!loadingRecords && !recordsError && records.length === 0 ? (
              <StatusAlert tone="info">No prize spin sessions yet</StatusAlert>
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
            disabled={isSavingWidget}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={() => void handleSaveWidgetSize()}
            disabled={isDialogLoadingWidget || isSavingWidget}
          >
            {isSavingWidget ? 'Saving…' : 'Save'}
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
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="prize-spin-create-form"
            variant="contained"
            disabled={isCreating}
          >
            {isCreating ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
