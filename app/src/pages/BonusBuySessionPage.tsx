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
  FormControlLabel,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import {
  ArrowLeft,
  Circle,
  CircleDot,
  CircleStop,
  ExternalLink,
  Link2,
  Palette,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { alpha, type Theme, useTheme } from '@mui/material/styles'
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  archiveBonusBuySlot,
  createBonusBuySlot,
  endBonusBuy,
  fetchBonusBuy,
  fetchBonusBuySlots,
  patchBonusBuy,
  patchBonusBuySlot,
  type BonusBuyRecord,
  type BonusBuySlot,
} from '@/api/bonus-buy'
import { AppTable, type AppTableColumn } from '@/components/AppTable'
import { PageHeader } from '@/components/PageHeader'
import { IconTile } from '@/components/IconTile'
import { StatusAlert } from '@/components/StatusAlert'
import { useAuth } from '@/context/AuthContext'
import { useSetBreadcrumbLabel } from '@/context/BreadcrumbContext'
import { useNotification } from '@/context/NotificationContext'
import {
  computeSessionStats,
  formatMultiplierDisplay,
} from '@/lib/bonus-buy-stats'
import { MODULE_CATALOG } from '@/lib/modules'
import { cardSx, colors, inputFieldSx, toneChipSx } from '@/theme/colors'

const bonusBuyModule = MODULE_CATALOG.find((module) => module.id === 'bonus-buy')!

function formatUsd(amount: string | number): string {
  const value = typeof amount === 'string' ? Number.parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function SlotExpandedDetails({ slot }: { slot: BonusBuySlot }) {
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
          Nick / provider
        </Typography>
        <Typography variant="body2">{slot.nickProvider || '—'}</Typography>
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
          Status
        </Typography>
        <Typography variant="body2">
          {slot.isNowPlaying ? 'Now playing' : '—'}
        </Typography>
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
          Created by
        </Typography>
        <Typography variant="body2">{slot.createdByName}</Typography>
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
        <Typography variant="body2">{formatDateTime(slot.createdAt)}</Typography>
      </Grid>
    </Grid>
  )
}

function playingSlotRowSx(theme: Theme) {
  return {
    bgcolor: alpha(theme.palette.warning.main, 0.08),
    boxShadow: `inset 0 0 0 2px ${alpha(theme.palette.warning.main, 0.55)}`,
    '&:hover': {
      bgcolor: alpha(theme.palette.warning.main, 0.12),
    },
  }
}

function slotActionIconButtonSx(
  palette: 'primary' | 'success' | 'warning' | 'info' | 'error',
  theme: Theme,
) {
  const color =
    palette === 'primary'
      ? theme.palette.primary
      : palette === 'success'
        ? theme.palette.success
        : palette === 'warning'
          ? theme.palette.warning
          : palette === 'info'
            ? theme.palette.info
            : theme.palette.error

  return {
    borderRadius: 1,
    width: 28,
    height: 28,
    bgcolor:
      palette === 'error'
        ? alpha(color.main, 0.12)
        : color.main,
    color:
      palette === 'error'
        ? color.main
        : color.contrastText,
    '&:hover': {
      bgcolor:
        palette === 'error'
          ? alpha(color.main, 0.2)
          : color.dark,
    },
  }
}

function StatCard({
  label,
  value,
  valueColor,
  action,
}: {
  label: string
  value: string
  valueColor?: string
  action?: React.ReactNode
}) {
  return (
    <Card elevation={0} sx={cardSx}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'text.secondary',
            mb: 1,
          }}
        >
          {label}
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              color: valueColor ?? 'inherit',
            }}
          >
            {value}
          </Typography>
          {action}
        </Stack>
      </CardContent>
    </Card>
  )
}

export function BonusBuySessionPage() {
  const theme = useTheme()
  const { id } = useParams()
  const { user } = useAuth()
  const { showSuccess, showError } = useNotification()

  const [record, setRecord] = useState<BonusBuyRecord | null>(null)
  const [slots, setSlots] = useState<BonusBuySlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [slotName, setSlotName] = useState('')
  const [nickProvider, setNickProvider] = useState('')
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isAddingSlot, setIsAddingSlot] = useState(false)

  const [titleDialogOpen, setTitleDialogOpen] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [titleError, setTitleError] = useState<string | null>(null)
  const [isSavingTitle, setIsSavingTitle] = useState(false)

  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false)
  const [startBalanceDraft, setStartBalanceDraft] = useState('')
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const [isSavingBalance, setIsSavingBalance] = useState(false)

  const [editSlot, setEditSlot] = useState<BonusBuySlot | null>(null)
  const [editSlotName, setEditSlotName] = useState('')
  const [editNickProvider, setEditNickProvider] = useState('')
  const [editPurchaseAmount, setEditPurchaseAmount] = useState('')
  const [editWinAmount, setEditWinAmount] = useState('')
  const [editNowPlaying, setEditNowPlaying] = useState(false)
  const [editSlotError, setEditSlotError] = useState<string | null>(null)
  const [isSavingSlot, setIsSavingSlot] = useState(false)

  const [deleteSlot, setDeleteSlot] = useState<BonusBuySlot | null>(null)
  const [isDeletingSlot, setIsDeletingSlot] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [expandedSlotIds, setExpandedSlotIds] = useState<Set<number>>(new Set())

  const [endDialogOpen, setEndDialogOpen] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [endError, setEndError] = useState<string | null>(null)

  useSetBreadcrumbLabel(
    record ? `${record.title} #${record.id}` : null,
  )

  const bonusBuyId = useMemo(() => {
    if (!id) {
      return null
    }
    const parsed = Number.parseInt(id, 10)
    return Number.isFinite(parsed) ? parsed : null
  }, [id])

  const loadData = useCallback(async () => {
    if (!user?.accountId || bonusBuyId === null) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [row, slotRows] = await Promise.all([
        fetchBonusBuy(user.accountId, bonusBuyId),
        fetchBonusBuySlots(user.accountId, bonusBuyId),
      ])
      setRecord(row)
      setSlots(slotRows)
      setTitleDraft(row.title)
      setStartBalanceDraft(row.startBalance)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Could not load bonus buy',
      )
    } finally {
      setLoading(false)
    }
  }, [bonusBuyId, user?.accountId])

  const refreshSlots = useCallback(async () => {
    if (!user?.accountId || bonusBuyId === null) {
      return
    }
    const slotRows = await fetchBonusBuySlots(user.accountId, bonusBuyId)
    setSlots(slotRows)
  }, [bonusBuyId, user?.accountId])

  useEffect(() => {
    if (bonusBuyId === null) {
      setError('Invalid bonus buy id')
      setLoading(false)
      return
    }
    void loadData()
  }, [bonusBuyId, loadData])

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

  function openEditSlot(slot: BonusBuySlot) {
    setEditSlot(slot)
    setEditSlotName(slot.slotName)
    setEditNickProvider(slot.nickProvider ?? '')
    setEditPurchaseAmount(slot.purchaseAmount)
    setEditWinAmount(slot.winAmount ?? '')
    setEditNowPlaying(slot.isNowPlaying)
    setEditSlotError(null)
  }

  function closeEditSlot() {
    setEditSlot(null)
    setEditSlotError(null)
  }

  async function handleAddSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (!user?.accountId || !record || bonusBuyId === null || !record.isActive) {
      return
    }

    const trimmedSlot = slotName.trim()
    const parsedPurchase = Number.parseFloat(purchaseAmount)

    if (!trimmedSlot) {
      setFormError('Slot name is required')
      return
    }

    if (!Number.isFinite(parsedPurchase) || parsedPurchase <= 0) {
      setFormError('Purchase amount must be greater than zero')
      return
    }

    setIsAddingSlot(true)
    try {
      await createBonusBuySlot(
        user.accountId,
        bonusBuyId,
        trimmedSlot,
        parsedPurchase.toFixed(2),
        nickProvider.trim() || undefined,
      )
      setSlotName('')
      setNickProvider('')
      setPurchaseAmount('')
      await refreshSlots()
      showSuccess('Slot added.')
    } catch (addError) {
      setFormError(
        addError instanceof Error ? addError.message : 'Could not add slot',
      )
    } finally {
      setIsAddingSlot(false)
    }
  }

  async function handleSaveTitle() {
    if (!user?.accountId || !record || bonusBuyId === null) {
      return
    }

    const trimmed = titleDraft.trim()
    if (!trimmed) {
      setTitleError('Title is required')
      return
    }

    setIsSavingTitle(true)
    setTitleError(null)
    try {
      const updated = await patchBonusBuy(user.accountId, bonusBuyId, {
        title: trimmed,
      })
      setRecord(updated)
      setTitleDialogOpen(false)
      showSuccess('Session title updated.')
    } catch (saveError) {
      setTitleError(
        saveError instanceof Error ? saveError.message : 'Could not update title',
      )
    } finally {
      setIsSavingTitle(false)
    }
  }

  async function handleSaveStartBalance() {
    if (!user?.accountId || !record || bonusBuyId === null) {
      return
    }

    const parsed = Number.parseFloat(startBalanceDraft)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setBalanceError('Start balance must be greater than zero')
      return
    }

    setIsSavingBalance(true)
    setBalanceError(null)
    try {
      const updated = await patchBonusBuy(user.accountId, bonusBuyId, {
        start_balance: parsed.toFixed(2),
      })
      setRecord(updated)
      setStartBalanceDraft(updated.startBalance)
      setBalanceDialogOpen(false)
      showSuccess('Start balance updated.')
    } catch (saveError) {
      setBalanceError(
        saveError instanceof Error
          ? saveError.message
          : 'Could not update start balance',
      )
    } finally {
      setIsSavingBalance(false)
    }
  }

  async function handleSaveEditSlot() {
    if (!user?.accountId || !editSlot || bonusBuyId === null) {
      return
    }

    const trimmedSlot = editSlotName.trim()
    const parsedPurchase = Number.parseFloat(editPurchaseAmount)
    const trimmedWin = editWinAmount.trim()

    if (!trimmedSlot) {
      setEditSlotError('Slot name is required')
      return
    }

    if (!Number.isFinite(parsedPurchase) || parsedPurchase <= 0) {
      setEditSlotError('Purchase amount must be greater than zero')
      return
    }

    if (trimmedWin) {
      const parsedWin = Number.parseFloat(trimmedWin)
      if (!Number.isFinite(parsedWin) || parsedWin < 0) {
        setEditSlotError('Win amount must be zero or greater')
        return
      }
    }

    setIsSavingSlot(true)
    setEditSlotError(null)
    try {
      await patchBonusBuySlot(user.accountId, bonusBuyId, editSlot.id, {
        slot_name: trimmedSlot,
        nick_provider: editNickProvider.trim() || null,
        purchase_amount: parsedPurchase.toFixed(2),
        win_amount: trimmedWin ? Number.parseFloat(trimmedWin).toFixed(2) : null,
        is_now_playing: editNowPlaying,
      })
      closeEditSlot()
      await refreshSlots()
      showSuccess('Slot updated.')
    } catch (saveError) {
      setEditSlotError(
        saveError instanceof Error ? saveError.message : 'Could not update slot',
      )
    } finally {
      setIsSavingSlot(false)
    }
  }

  async function handleSetPlaying(slot: BonusBuySlot, playing: boolean) {
    if (!user?.accountId || bonusBuyId === null) {
      return
    }

    try {
      await patchBonusBuySlot(user.accountId, bonusBuyId, slot.id, {
        is_now_playing: playing,
      })
      await refreshSlots()
      showSuccess(playing ? 'Slot set as now playing.' : 'Now playing cleared.')
    } catch (playingError) {
      showError(
        playingError instanceof Error
          ? playingError.message
          : 'Could not update playing state',
      )
    }
  }

  async function handleConfirmDelete() {
    if (!user?.accountId || !deleteSlot || bonusBuyId === null) {
      return
    }

    setIsDeletingSlot(true)
    setDeleteError(null)
    try {
      await archiveBonusBuySlot(user.accountId, bonusBuyId, deleteSlot.id)
      setDeleteSlot(null)
      await refreshSlots()
      showSuccess('Slot deleted.')
    } catch (deleteSlotError) {
      setDeleteError(
        deleteSlotError instanceof Error
          ? deleteSlotError.message
          : 'Could not delete slot',
      )
    } finally {
      setIsDeletingSlot(false)
    }
  }

  async function handleEndSession() {
    if (!user?.accountId || !record) {
      return
    }

    setIsEnding(true)
    setEndError(null)

    try {
      const updated = await endBonusBuy(user.accountId, record.id)
      setRecord(updated)
      setEndDialogOpen(false)
      showSuccess('Bonus buy session ended.')
    } catch (endSessionError) {
      setEndError(
        endSessionError instanceof Error
          ? endSessionError.message
          : 'Could not end bonus buy session',
      )
    } finally {
      setIsEnding(false)
    }
  }

  function showStub(message: string) {
    showSuccess(message)
  }

  function toggleSlotExpanded(slotId: number) {
    setExpandedSlotIds((previous) => {
      const next = new Set(previous)
      if (next.has(slotId)) {
        next.delete(slotId)
      } else {
        next.add(slotId)
      }
      return next
    })
  }

  const slotColumns: AppTableColumn<BonusBuySlot>[] = useMemo(
    () => [
      {
        id: 'slotName',
        header: 'Slot',
        width: '100%',
        sx: {
          fontWeight: 500,
          minWidth: 0,
        },
        render: (slot) => (
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', minWidth: 0 }}
          >
            <Box
              component="span"
              sx={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {slot.slotName}
            </Box>
            {slot.isNowPlaying ? (
              <Chip
                label="Now playing"
                size="small"
                sx={{
                  flexShrink: 0,
                  ...toneChipSx(theme.palette.success.light),
                }}
              />
            ) : null}
          </Stack>
        ),
      },
      {
        id: 'purchase',
        header: 'Purchase',
        width: 110,
        render: (slot) => formatUsd(slot.purchaseAmount),
      },
      {
        id: 'win',
        header: 'Win',
        width: 100,
        sx: { color: 'text.secondary' },
        render: (slot) =>
          slot.winAmount == null ? 'Pending' : formatUsd(slot.winAmount),
      },
      {
        id: 'multiplier',
        header: 'Multiplier',
        width: 100,
        sx: { color: 'text.secondary' },
        render: (slot) => formatMultiplierDisplay(slot.multiplier),
      },
      {
        id: 'actions',
        header: 'Actions',
        width: 112,
        minWidth: 112,
        align: 'right',
        sx: { px: 1, whiteSpace: 'nowrap' },
        render: (slot) => (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <IconButton
              size="small"
              aria-label={
                slot.isNowPlaying
                  ? `Clear now playing for ${slot.slotName}`
                  : `Set ${slot.slotName} as now playing`
              }
              aria-pressed={slot.isNowPlaying}
              onClick={() =>
                void handleSetPlaying(slot, !slot.isNowPlaying)
              }
              sx={slotActionIconButtonSx(
                slot.isNowPlaying ? 'warning' : 'primary',
                theme,
              )}
            >
              {slot.isNowPlaying ? (
                <CircleDot size={14} aria-hidden />
              ) : (
                <Circle size={14} aria-hidden />
              )}
            </IconButton>
            <IconButton
              size="small"
              aria-label={`Edit ${slot.slotName}`}
              onClick={() => openEditSlot(slot)}
              sx={slotActionIconButtonSx('info', theme)}
            >
              <Pencil size={14} aria-hidden />
            </IconButton>
            <IconButton
              size="small"
              aria-label={`Delete ${slot.slotName}`}
              onClick={() => {
                setDeleteSlot(slot)
                setDeleteError(null)
              }}
              sx={slotActionIconButtonSx('error', theme)}
            >
              <Trash2 size={14} aria-hidden />
            </IconButton>
          </Box>
        ),
      },
    ],
    [theme],
  )

  if (loading) {
    return (
      <Stack spacing={4}>
        <PageHeader
          title={bonusBuyModule.name}
          description={bonusBuyModule.description}
          icon={bonusBuyModule.icon}
          iconVariant={bonusBuyModule.iconVariant}
        />
        <Skeleton variant="rounded" height={64} />
        <Grid container spacing={1.5}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <Skeleton variant="rounded" height={96} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={192} />
        <Skeleton variant="rounded" height={160} />
      </Stack>
    )
  }

  if (error || !record) {
    return (
      <Stack spacing={4}>
        <PageHeader
          title={bonusBuyModule.name}
          description={bonusBuyModule.description}
          icon={bonusBuyModule.icon}
          iconVariant={bonusBuyModule.iconVariant}
        />
        <StatusAlert tone="error">{error ?? 'Session not found'}</StatusAlert>
        <Button component={Link} to="/bonus-buy" variant="outlined">
          Back to history
        </Button>
      </Stack>
    )
  }

  const profitValue = Number.parseFloat(stats.profit)

  return (
    <Stack spacing={4}>
      <PageHeader
        title={bonusBuyModule.name}
        description={bonusBuyModule.description}
        icon={bonusBuyModule.icon}
        iconVariant={bonusBuyModule.iconVariant}
      />

      <Card elevation={0} sx={cardSx}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={2}
            sx={{ alignItems: { lg: 'center' }, justifyContent: 'space-between' }}
          >
            <Stack direction="row" spacing={1} sx={{ minWidth: 0, alignItems: 'center' }}>
              <IconButton
                component={Link}
                to="/bonus-buy"
                aria-label="Back to history"
                size="small"
              >
                <ArrowLeft size={16} aria-hidden />
              </IconButton>

              <Stack direction="row" spacing={1} sx={{ minWidth: 0, alignItems: 'center' }}>
                <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
                  {record.title}{' '}
                  <Typography
                    component="span"
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    #{record.id}
                  </Typography>
                </Typography>

                {!record.isActive ? (
                  <Chip
                    label="Ended"
                    size="small"
                    variant="outlined"
                    sx={{
                      flexShrink: 0,
                      color: 'text.secondary',
                      borderColor: 'divider',
                    }}
                  />
                ) : null}

                {record.isActive ? (
                  <IconButton
                    type="button"
                    size="small"
                    aria-label="Edit title"
                    onClick={() => {
                      setTitleDraft(record.title)
                      setTitleError(null)
                      setTitleDialogOpen(true)
                    }}
                  >
                    <Pencil size={14} aria-hidden />
                  </IconButton>
                ) : null}
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {record.isActive ? (
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<CircleStop size={16} aria-hidden />}
                  onClick={() => setEndDialogOpen(true)}
                  sx={{
                    borderColor: alpha(theme.palette.error.main, 0.4),
                    color: theme.palette.error.main,
                    '&:hover': {
                      borderColor: theme.palette.error.main,
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                    },
                  }}
                >
                  End bonus buy
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<Palette size={16} aria-hidden />}
                onClick={() => showStub('Coming soon')}
              >
                Widget style
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<Link2 size={16} aria-hidden />}
                onClick={() => showStub('Coming soon')}
              >
                OBS link
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<ExternalLink size={16} aria-hidden />}
                onClick={() => showStub('Coming soon')}
              >
                Overlay
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {!record.isActive ? (
        <StatusAlert tone="warning">
          This bonus buy session has ended.
        </StatusAlert>
      ) : null}

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            label="Start balance"
            value={formatUsd(record.startBalance)}
            action={
              record.isActive ? (
                <IconButton
                  type="button"
                  size="small"
                  aria-label="Edit start balance"
                  onClick={() => {
                    setStartBalanceDraft(record.startBalance)
                    setBalanceError(null)
                    setBalanceDialogOpen(true)
                  }}
                >
                  <Pencil size={14} aria-hidden />
                </IconButton>
              ) : null
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            label="Current balance"
            value={formatUsd(stats.currentBalance)}
            valueColor={theme.palette.success.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard label="Spent" value={formatUsd(stats.spent)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            label="Profit"
            value={formatUsd(stats.profit)}
            valueColor={profitValue >= 0 ? theme.palette.success.main : undefined}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard label="Average X" value={stats.averageX} />
        </Grid>
      </Grid>

      <Card elevation={0} sx={cardSx}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Box component="form" onSubmit={handleAddSlot}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                mb: 2.5,
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <IconTile icon={Plus} variant="success" />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    Quick add slot
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
                    Enter slot details and purchase amount in USD
                  </Typography>
                </Box>
              </Box>
              <Button
                type="submit"
                variant="contained"
                disabled={!record.isActive || isAddingSlot}
                startIcon={<Plus size={16} aria-hidden />}
                sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' }, flexShrink: 0 }}
              >
                {isAddingSlot ? 'Adding…' : 'Add slot'}
              </Button>
            </Stack>

            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                bgcolor: alpha(colors.neutral[100], 0.02),
                p: 2,
                transition: 'opacity 0.15s ease',
                ...(!record.isActive ? { opacity: 0.55 } : {}),
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    id="session-slot-name"
                    label="Slot"
                    required
                    value={slotName}
                    onChange={(event) => setSlotName(event.target.value)}
                    placeholder="Gates of Olympus"
                    disabled={!record.isActive || isAddingSlot}
                    fullWidth
                    size="small"
                    sx={inputFieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    id="session-nick-provider"
                    label="Nick / provider"
                    value={nickProvider}
                    onChange={(event) => setNickProvider(event.target.value)}
                    placeholder="Pragmatic Play"
                    disabled={!record.isActive || isAddingSlot}
                    fullWidth
                    size="small"
                    sx={inputFieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    id="session-purchase"
                    label="Purchase ($)"
                    required
                    type="number"
                    slotProps={{
                      htmlInput: { step: '0.01', min: 0, inputMode: 'decimal' },
                    }}
                    value={purchaseAmount}
                    onChange={(event) => setPurchaseAmount(event.target.value)}
                    placeholder="50.00"
                    disabled={!record.isActive || isAddingSlot}
                    fullWidth
                    size="small"
                    sx={inputFieldSx}
                  />
                </Grid>
              </Grid>

              {formError ? (
                <Box sx={{ mt: 2 }}>
                  <StatusAlert tone="error">{formError}</StatusAlert>
                </Box>
              ) : null}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card elevation={0} sx={cardSx}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Bonus list ({slots.length})
          </Typography>
          <AppTable
            columns={slotColumns}
            rows={slots}
            getRowKey={(slot) => slot.id}
            emptyMessage="No bonuses added yet."
            getRowSx={(slot) =>
              slot.isNowPlaying ? playingSlotRowSx(theme) : undefined
            }
            expandable={{
              isExpanded: (slot) => expandedSlotIds.has(slot.id),
              onToggle: (slot) => toggleSlotExpanded(slot.id),
              ariaLabel: (slot) =>
                expandedSlotIds.has(slot.id)
                  ? `Collapse details for ${slot.slotName}`
                  : `Expand details for ${slot.slotName}`,
              renderDetail: (slot) => <SlotExpandedDetails slot={slot} />,
            }}
          />
        </CardContent>
      </Card>

      <Dialog
        open={titleDialogOpen}
        onClose={() => setTitleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit session title</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            value={titleDraft}
            onChange={(event) => setTitleDraft(event.target.value)}
            fullWidth
            autoFocus
            sx={{ mt: 1, ...inputFieldSx }}
          />
          {titleError ? (
            <Box sx={{ mt: 2 }}>
              <StatusAlert tone="error">{titleError}</StatusAlert>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTitleDialogOpen(false)} disabled={isSavingTitle}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSaveTitle()}
            disabled={isSavingTitle}
          >
            {isSavingTitle ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={balanceDialogOpen}
        onClose={() => setBalanceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit start balance</DialogTitle>
        <DialogContent>
          <TextField
            label="Start balance ($)"
            type="number"
            value={startBalanceDraft}
            onChange={(event) => setStartBalanceDraft(event.target.value)}
            slotProps={{
              htmlInput: { step: '0.01', min: 0, inputMode: 'decimal' },
            }}
            fullWidth
            autoFocus
            sx={{ mt: 1, ...inputFieldSx }}
          />
          {balanceError ? (
            <Box sx={{ mt: 2 }}>
              <StatusAlert tone="error">{balanceError}</StatusAlert>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setBalanceDialogOpen(false)}
            disabled={isSavingBalance}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSaveStartBalance()}
            disabled={isSavingBalance}
          >
            {isSavingBalance ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editSlot !== null} onClose={closeEditSlot} maxWidth="sm" fullWidth>
        <DialogTitle>Edit slot</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Slot"
              value={editSlotName}
              onChange={(event) => setEditSlotName(event.target.value)}
              fullWidth
              sx={inputFieldSx}
            />
            <TextField
              label="Nick / provider"
              value={editNickProvider}
              onChange={(event) => setEditNickProvider(event.target.value)}
              fullWidth
              sx={inputFieldSx}
            />
            <TextField
              label="Purchase ($)"
              type="number"
              value={editPurchaseAmount}
              onChange={(event) => setEditPurchaseAmount(event.target.value)}
              slotProps={{
                htmlInput: { step: '0.01', min: 0, inputMode: 'decimal' },
              }}
              fullWidth
              sx={inputFieldSx}
            />
            <TextField
              label="Win ($)"
              type="number"
              value={editWinAmount}
              onChange={(event) => setEditWinAmount(event.target.value)}
              placeholder="Leave empty if pending"
              slotProps={{
                htmlInput: { step: '0.01', min: 0, inputMode: 'decimal' },
              }}
              fullWidth
              sx={inputFieldSx}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editNowPlaying}
                  onChange={(event) => setEditNowPlaying(event.target.checked)}
                />
              }
              label="Now playing"
            />
          </Stack>
          {editSlotError ? (
            <Box sx={{ mt: 2 }}>
              <StatusAlert tone="error">{editSlotError}</StatusAlert>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeEditSlot} disabled={isSavingSlot}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSaveEditSlot()}
            disabled={isSavingSlot}
          >
            {isSavingSlot ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteSlot !== null}
        onClose={() => setDeleteSlot(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete slot?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {deleteSlot
              ? `Remove "${deleteSlot.slotName}" from this session? The record will be archived.`
              : null}
          </Typography>
          {deleteError ? (
            <Box sx={{ mt: 2 }}>
              <StatusAlert tone="error">{deleteError}</StatusAlert>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteSlot(null)} disabled={isDeletingSlot}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void handleConfirmDelete()}
            disabled={isDeletingSlot}
          >
            {isDeletingSlot ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={endDialogOpen}
        onClose={() => setEndDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>End bonus buy session?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This marks the session as ended. You can still view stats and the
            bonus list, but adding new slots will be disabled.
          </Typography>
          {endError ? (
            <StatusAlert tone="error">{endError}</StatusAlert>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEndDialogOpen(false)} disabled={isEnding}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="contained"
            color="error"
            onClick={() => void handleEndSession()}
            disabled={isEnding}
          >
            {isEnding ? 'Ending…' : 'End session'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
