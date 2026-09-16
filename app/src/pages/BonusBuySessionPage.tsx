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
import {
  Circle,
  CircleDot,
  CircleStop,
  Copy,
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
  fetchBonusBuyWidget,
  patchBonusBuy,
  patchBonusBuySlot,
  patchBonusBuyWidget,
  type BonusBuyRecord,
  type BonusBuySlot,
  type BonusBuyWidgetSettings,
} from '@/api/bonus-buy'
import { AppTable, type AppTableColumn } from '@/components/AppTable'
import { PageHeader } from '@/components/PageHeader'
import { IconTile } from '@/components/IconTile'
import { StatusAlert } from '@/components/StatusAlert'
import { useAuth } from '@/context/AuthContext'
import { useSetBreadcrumbLabel } from '@/context/BreadcrumbContext'
import { useNotification } from '@/context/NotificationContext'
import { HexColorField } from '@/components/bonus-buy/HexColorField'
import { WidgetStylePreview } from '@/components/bonus-buy/WidgetStylePreview'
import { WidgetThemePresetPicker } from '@/components/bonus-buy/WidgetThemePresetPicker'
import {
  computeSessionStats,
  formatMultiplierDisplay,
} from '@/lib/bonus-buy-stats'
import {
  applyBonusBuyWidgetPreset,
  matchBonusBuyWidgetPreset,
  type BonusBuyWidgetPresetId,
} from '@/lib/bonus-buy-widget-presets'
import { validateBonusBuyWidgetDraft } from '@/lib/bonus-buy-widget-validation'
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

function signedValueColor(value: number, theme: Theme): string | undefined {
  if (value > 0) {
    return theme.palette.success.main
  }
  if (value < 0) {
    return theme.palette.error.main
  }
  return undefined
}

function parseAverageX(value: string): number {
  return Number.parseFloat(value.replace(/x$/i, ''))
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
          Nickname
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

  const [sessionDialogOpen, setSessionDialogOpen] = useState(false)
  const [sessionTitleDraft, setSessionTitleDraft] = useState('')
  const [sessionBalanceDraft, setSessionBalanceDraft] = useState('')
  const [sessionEditError, setSessionEditError] = useState<string | null>(null)
  const [isSavingSession, setIsSavingSession] = useState(false)

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

  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false)
  const [widgetPreviewDialogOpen, setWidgetPreviewDialogOpen] = useState(false)
  const [widgetDraft, setWidgetDraft] = useState<BonusBuyWidgetSettings | null>(null)
  const [lastValidWidgetDraft, setLastValidWidgetDraft] =
    useState<BonusBuyWidgetSettings | null>(null)
  const [widgetEditError, setWidgetEditError] = useState<string | null>(null)
  const [isLoadingWidget, setIsLoadingWidget] = useState(false)
  const [isSavingWidget, setIsSavingWidget] = useState(false)

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

  function openSessionEdit() {
    if (!record) {
      return
    }

    setSessionTitleDraft(record.title)
    setSessionBalanceDraft(record.startBalance)
    setSessionEditError(null)
    setSessionDialogOpen(true)
  }

  async function handleSaveSession() {
    if (!user?.accountId || !record || bonusBuyId === null) {
      return
    }

    const trimmedTitle = sessionTitleDraft.trim()
    if (!trimmedTitle) {
      setSessionEditError('Title is required')
      return
    }

    const parsedBalance = Number.parseFloat(sessionBalanceDraft)
    if (!Number.isFinite(parsedBalance) || parsedBalance <= 0) {
      setSessionEditError('Start balance must be greater than zero')
      return
    }

    setIsSavingSession(true)
    setSessionEditError(null)
    try {
      const updated = await patchBonusBuy(user.accountId, bonusBuyId, {
        title: trimmedTitle,
        start_balance: parsedBalance.toFixed(2),
      })
      setRecord(updated)
      setSessionDialogOpen(false)
      showSuccess('Session updated.')
    } catch (saveError) {
      setSessionEditError(
        saveError instanceof Error ? saveError.message : 'Could not update session',
      )
    } finally {
      setIsSavingSession(false)
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
      if (!Number.isFinite(parsedWin)) {
        setEditSlotError('Win amount must be a valid number')
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

  async function openWidgetStyleDialog() {
    if (!user?.accountId) {
      return
    }

    setWidgetDialogOpen(true)
    setWidgetEditError(null)
    setIsLoadingWidget(true)

    try {
      const settings = await fetchBonusBuyWidget(user.accountId)
      setWidgetDraft(settings)
      setLastValidWidgetDraft(settings)
    } catch (loadError) {
      setWidgetEditError(
        loadError instanceof Error
          ? loadError.message
          : 'Could not load widget settings',
      )
      setWidgetDraft(null)
    } finally {
      setIsLoadingWidget(false)
    }
  }

  function updateWidgetDraft<K extends keyof BonusBuyWidgetSettings>(
    key: K,
    value: BonusBuyWidgetSettings[K],
  ) {
    setWidgetDraft((previous) =>
      previous ? { ...previous, [key]: value } : previous,
    )
  }

  useEffect(() => {
    if (!widgetDraft) {
      return
    }

    if (validateBonusBuyWidgetDraft(widgetDraft) === null) {
      setLastValidWidgetDraft(widgetDraft)
    }
  }, [widgetDraft])

  const widgetDraftValidationError = useMemo(() => {
    if (!widgetDraft) {
      return null
    }
    return validateBonusBuyWidgetDraft(widgetDraft)
  }, [widgetDraft])

  const widgetPreviewTheme = lastValidWidgetDraft ?? widgetDraft

  const widgetPreviewDimensionLabel = widgetDraft
    ? `${widgetDraft.width} × ${widgetDraft.height}`
    : undefined

  const activeWidgetPresetId = useMemo(() => {
    if (!widgetDraft) {
      return null
    }
    return matchBonusBuyWidgetPreset(widgetDraft)
  }, [widgetDraft])

  function applyWidgetPreset(presetId: BonusBuyWidgetPresetId) {
    setWidgetDraft((previous) =>
      previous ? applyBonusBuyWidgetPreset(previous, presetId) : previous,
    )
  }

  async function handleSaveWidgetStyle() {
    if (!user?.accountId || !widgetDraft) {
      return
    }

    const validationError = validateBonusBuyWidgetDraft(widgetDraft)
    if (validationError) {
      setWidgetEditError(validationError)
      return
    }

    setIsSavingWidget(true)
    setWidgetEditError(null)

    try {
      await patchBonusBuyWidget(user.accountId, {
        width: widgetDraft.width,
        height: widgetDraft.height,
        background_color: widgetDraft.backgroundColor.trim(),
        surface_color: widgetDraft.surfaceColor.trim(),
        border_color: widgetDraft.borderColor.trim(),
        accent_color: widgetDraft.accentColor.trim(),
        positive_color: widgetDraft.positiveColor.trim(),
        negative_color: widgetDraft.negativeColor.trim(),
        live_color: widgetDraft.liveColor.trim(),
        text_muted_color: widgetDraft.textMutedColor.trim(),
        border_radius: widgetDraft.borderRadius,
        padding: widgetDraft.padding,
        font_family: widgetDraft.fontFamily.trim(),
      })
      setWidgetDialogOpen(false)
      showSuccess('Widget style saved')
    } catch (saveError) {
      setWidgetEditError(
        saveError instanceof Error
          ? saveError.message
          : 'Could not save widget settings',
      )
    } finally {
      setIsSavingWidget(false)
    }
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

  async function handleCopySlotName(slot: BonusBuySlot) {
    try {
      await navigator.clipboard.writeText(slot.slotName)
      showSuccess('Slot name copied.')
    } catch {
      showError('Could not copy slot name.')
    }
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
            <IconButton
              size="small"
              aria-label={`Copy ${slot.slotName}`}
              onClick={(event) => {
                event.stopPropagation()
                void handleCopySlotName(slot)
              }}
              sx={{
                width: 24,
                height: 24,
                flexShrink: 0,
                color: theme.palette.warning.main,
                '&:hover': {
                  color: theme.palette.warning.dark,
                  bgcolor: alpha(theme.palette.warning.main, 0.12),
                },
              }}
            >
              <Copy size={12} aria-hidden />
            </IconButton>
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
        render: (slot) => {
          if (slot.winAmount == null) {
            return (
              <Box component="span" sx={{ color: 'text.secondary' }}>
                Pending
              </Box>
            )
          }

          const value = Number.parseFloat(slot.winAmount)
          return (
            <Box
              component="span"
              sx={{ color: signedValueColor(value, theme) ?? 'inherit' }}
            >
              {formatUsd(slot.winAmount)}
            </Box>
          )
        },
      },
      {
        id: 'multiplier',
        header: 'Multiplier',
        width: 100,
        render: (slot) => {
          if (!slot.multiplier) {
            return (
              <Box component="span" sx={{ color: 'text.secondary' }}>
                —
              </Box>
            )
          }

          const value = Number.parseFloat(slot.multiplier)
          return (
            <Box
              component="span"
              sx={{ color: signedValueColor(value, theme) ?? 'inherit' }}
            >
              {formatMultiplierDisplay(slot.multiplier)}
            </Box>
          )
        },
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
  const currentBalanceValue = Number.parseFloat(stats.currentBalance)
  const averageXValue = parseAverageX(stats.averageX)

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
                  End Bonus Buy
                </Button>
              ) : null}
              {record.isActive ? (
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<Pencil size={16} aria-hidden />}
                  onClick={openSessionEdit}
                >
                  Edit
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<Palette size={16} aria-hidden />}
                onClick={() => void openWidgetStyleDialog()}
              >
                Widget Style
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<Link2 size={16} aria-hidden />}
                onClick={() => showStub('Coming soon')}
              >
                OBS Link
              </Button>
              <Button
                component={Link}
                to={id ? `/bonus-buy/${id}/widget` : '/bonus-buy'}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="small"
                startIcon={<ExternalLink size={16} aria-hidden />}
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
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            label="Current balance"
            value={formatUsd(stats.currentBalance)}
            valueColor={signedValueColor(currentBalanceValue, theme)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard label="Spent" value={formatUsd(stats.spent)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            label="Profit"
            value={formatUsd(stats.profit)}
            valueColor={signedValueColor(profitValue, theme)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            label="Average X"
            value={stats.averageX}
            valueColor={signedValueColor(averageXValue, theme)}
          />
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
                    disabled={!record.isActive || isAddingSlot}
                    fullWidth
                    size="small"
                    sx={inputFieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    id="session-nick-provider"
                    label="Nickname"
                    value={nickProvider}
                    onChange={(event) => setNickProvider(event.target.value)}
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
        open={sessionDialogOpen}
        onClose={() => setSessionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={sessionTitleDraft}
              onChange={(event) => setSessionTitleDraft(event.target.value)}
              fullWidth
              autoFocus
              sx={inputFieldSx}
            />
            <TextField
              label="Start balance ($)"
              type="number"
              value={sessionBalanceDraft}
              onChange={(event) => setSessionBalanceDraft(event.target.value)}
              slotProps={{
                htmlInput: { step: '0.01', min: 0, inputMode: 'decimal' },
              }}
              fullWidth
              sx={inputFieldSx}
            />
          </Stack>
          {sessionEditError ? (
            <Box sx={{ mt: 2 }}>
              <StatusAlert tone="error">{sessionEditError}</StatusAlert>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setSessionDialogOpen(false)}
            disabled={isSavingSession}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSaveSession()}
            disabled={isSavingSession}
          >
            {isSavingSession ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={widgetDialogOpen}
        onClose={() => setWidgetDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Widget style</DialogTitle>
        <DialogContent>
          {isLoadingWidget ? (
            <Typography sx={{ py: 2, color: 'text.secondary' }}>
              Loading settings…
            </Typography>
          ) : widgetDraft ? (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <WidgetThemePresetPicker
                  activePresetId={activeWidgetPresetId}
                  onSelectPreset={applyWidgetPreset}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Size
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Width (px)"
                        type="number"
                        value={widgetDraft.width}
                        onChange={(event) =>
                          updateWidgetDraft(
                            'width',
                            Number.parseInt(event.target.value, 10) || 0,
                          )
                        }
                        fullWidth
                        sx={inputFieldSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Height (px)"
                        type="number"
                        value={widgetDraft.height}
                        onChange={(event) =>
                          updateWidgetDraft(
                            'height',
                            Number.parseInt(event.target.value, 10) || 0,
                          )
                        }
                        fullWidth
                        sx={inputFieldSx}
                      />
                    </Grid>
                  </Grid>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Colors
                  </Typography>
                  <Grid container spacing={2}>
                    {(
                      [
                        ['backgroundColor', 'Background'],
                        ['surfaceColor', 'Surface'],
                        ['borderColor', 'Border'],
                        ['accentColor', 'Accent'],
                        ['positiveColor', 'Positive'],
                        ['negativeColor', 'Negative'],
                        ['liveColor', 'Live'],
                        ['textMutedColor', 'Text muted'],
                      ] as const
                    ).map(([key, label]) => (
                      <Grid key={key} size={{ xs: 12, sm: 6 }}>
                        <HexColorField
                          label={label}
                          value={widgetDraft[key]}
                          onChange={(nextValue) => updateWidgetDraft(key, nextValue)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Shape
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Border radius (px)"
                        type="number"
                        value={widgetDraft.borderRadius}
                        onChange={(event) =>
                          updateWidgetDraft(
                            'borderRadius',
                            Number.parseInt(event.target.value, 10) || 0,
                          )
                        }
                        fullWidth
                        sx={inputFieldSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Padding (px)"
                        type="number"
                        value={widgetDraft.padding}
                        onChange={(event) =>
                          updateWidgetDraft(
                            'padding',
                            Number.parseInt(event.target.value, 10) || 0,
                          )
                        }
                        fullWidth
                        sx={inputFieldSx}
                      />
                    </Grid>
                  </Grid>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Typography
                  </Typography>
                  <TextField
                    label="Font family"
                    value={widgetDraft.fontFamily}
                    onChange={(event) => updateWidgetDraft('fontFamily', event.target.value)}
                    fullWidth
                    sx={inputFieldSx}
                  />
                </Stack>
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}
              >
                <WidgetStylePreview
                  record={record}
                  slots={slots}
                  previewTheme={widgetPreviewTheme}
                  dimensionLabel={widgetPreviewDimensionLabel}
                  validationError={widgetDraftValidationError}
                />
              </Grid>
            </Grid>
          ) : null}
          {widgetEditError ? (
            <Box sx={{ mt: 2 }}>
              <StatusAlert tone="error">{widgetEditError}</StatusAlert>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Button
            onClick={() => setWidgetPreviewDialogOpen(true)}
            disabled={!widgetDraft || !record}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            Preview
          </Button>
          <Button
            component={Link}
            to={id ? `/bonus-buy/${id}/widget` : '/bonus-buy'}
            target="_blank"
            rel="noopener noreferrer"
            disabled={!id}
          >
            Preview overlay
          </Button>
          <Button onClick={() => setWidgetDialogOpen(false)} disabled={isSavingWidget}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSaveWidgetStyle()}
            disabled={isSavingWidget || isLoadingWidget || !widgetDraft}
          >
            {isSavingWidget ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={widgetPreviewDialogOpen}
        onClose={() => setWidgetPreviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Widget preview</DialogTitle>
        <DialogContent>
          <WidgetStylePreview
            record={record}
            slots={slots}
            previewTheme={widgetPreviewTheme}
            dimensionLabel={widgetPreviewDimensionLabel}
            validationError={widgetDraftValidationError}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setWidgetPreviewDialogOpen(false)}>Close</Button>
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
              label="Nickname"
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
                htmlInput: { step: '0.01', inputMode: 'decimal' },
              }}
              fullWidth
              sx={inputFieldSx}
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
