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
  Typography,
} from '@mui/material'
import { useTheme, alpha, type Theme } from '@mui/material/styles'
import { ArrowRight, Plus, RotateCw } from 'lucide-react'
import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createPrizeSpin,
  fetchPrizeSpins,
  type PrizeSpinRecord,
} from '@/api/prize-spin'
import { AppTable, type AppTableColumn } from '@/components/AppTable'
import { PageHeader } from '@/components/PageHeader'
import { StatusAlert } from '@/components/StatusAlert'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import { cardSx, inputFieldSx, mutedChipSx, toneChipSx } from '@/theme/colors'

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

function recordStatusChip(
  isActive: boolean,
  palette: Theme['palette'],
  theme: Theme,
) {
  if (isActive) {
    return (
      <Chip
        label="Active"
        size="small"
        sx={toneChipSx(palette.success.light)}
      />
    )
  }

  return (
    <Chip label="Inactive" size="small" sx={mutedChipSx(theme)} />
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
        recordStatusChip(record.isActive, theme.palette, theme),
    },
    {
      id: 'action',
      header: '',
      align: 'right',
      width: 56,
      minWidth: 56,
      sx: { px: 1, whiteSpace: 'nowrap' },
      render: (record) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
        </Box>
      ),
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
          <Stack
            direction="row"
            spacing={2}
            sx={{ mb: 3, alignItems: 'flex-start', justifyContent: 'space-between' }}
          >
            <Stack direction="row" spacing={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.secondary.main, 0.14),
                  color: theme.palette.secondary.main,
                }}
              >
                <RotateCw size={20} aria-hidden />
              </Box>
              <Stack spacing={0.5}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  History
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Prize spin sessions for this account
                </Typography>
              </Stack>
            </Stack>
            {user?.accountId ? (
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
            ) : null}
          </Stack>

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
