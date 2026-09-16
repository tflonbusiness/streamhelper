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
import { ArrowRight, Gift, Plus } from 'lucide-react'
import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createBonusBuy,
  fetchBonusBuys,
  type BonusBuyRecord,
} from '@/api/bonus-buy'
import { AppTable, type AppTableColumn } from '@/components/AppTable'
import { PageHeader } from '@/components/PageHeader'
import { StatusAlert } from '@/components/StatusAlert'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import { cardSx, inputFieldSx, mutedChipSx, toneChipSx } from '@/theme/colors'

function formatUsd(amount: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number.parseFloat(amount))
}

const DEFAULT_TITLE = 'Bonus Buy'
const DEFAULT_START_BALANCE = '0'

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function RecordExpandedDetails({ record }: { record: BonusBuyRecord }) {
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

export function BonusBuyPage() {
  const theme = useTheme()
  const { user } = useAuth()
  const { showSuccess } = useNotification()
  const [records, setRecords] = useState<BonusBuyRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(true)
  const [recordsError, setRecordsError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [title, setTitle] = useState(DEFAULT_TITLE)
  const [startBalance, setStartBalance] = useState(DEFAULT_START_BALANCE)
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
      const rows = await fetchBonusBuys(user.accountId)
      setRecords(rows)
    } catch (error) {
      setRecordsError(
        error instanceof Error
          ? error.message
          : 'Could not load bonus buy history',
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
    setStartBalance(DEFAULT_START_BALANCE)
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
      await createBonusBuy(user.accountId, title, startBalance)
      setCreateDialogOpen(false)
      resetCreateForm()
      await loadRecords()
      showSuccess('Bonus buy session created.')
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : 'Could not create bonus buy',
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

  const recordColumns: AppTableColumn<BonusBuyRecord>[] = [
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
      id: 'startBalance',
      header: 'Start balance',
      width: 120,
      minWidth: 120,
      sx: { whiteSpace: 'nowrap' },
      render: (record) => formatUsd(record.startBalance),
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
            to={`/bonus-buy/${record.id}`}
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
        title="Bonus Buy"
        description="Bonus buy widget for your stream"
        icon={Gift}
        iconVariant="warning"
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
                  bgcolor: alpha(theme.palette.warning.main, 0.14),
                  color: theme.palette.warning.main,
                }}
              >
                <Gift size={20} aria-hidden />
              </Box>
              <Stack spacing={0.5}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  History
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bonus buy sessions for this account
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
              <StatusAlert tone="info">No bonus buy sessions yet</StatusAlert>
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
        <DialogTitle>New Bonus Buy</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create a bonus buy session with a title and starting balance in USD.
          </Typography>
          <Box
            component="form"
            id="bonus-buy-create-form"
            onSubmit={handleCreate}
          >
            <Stack spacing={2.5}>
              <TextField
                id="bonus-buy-title"
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
              <TextField
                id="bonus-buy-balance"
                label="Start balance (USD)"
                type="number"
                slotProps={{
                  htmlInput: { step: '0.01', min: 0, inputMode: 'decimal' },
                }}
                value={startBalance}
                onChange={(event) => setStartBalance(event.target.value)}
                required
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
            form="bonus-buy-create-form"
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
