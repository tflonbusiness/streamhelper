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
  ArrowLeft,
  CircleStop,
  ExternalLink,
  Link2,
  Palette,
  Pencil,
  Plus,
} from 'lucide-react'
import { alpha, useTheme } from '@mui/material/styles'
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { endBonusBuy, fetchBonusBuy, type BonusBuyRecord } from '@/api/bonus-buy'
import { AppTable, type AppTableColumn } from '@/components/AppTable'
import { PageHeader } from '@/components/PageHeader'
import { IconTile } from '@/components/IconTile'
import { StatusAlert } from '@/components/StatusAlert'
import { useAuth } from '@/context/AuthContext'
import { useSetBreadcrumbLabel } from '@/context/BreadcrumbContext'
import { MODULE_CATALOG } from '@/lib/modules'
import { cardSx, colors, inputFieldSx } from '@/theme/colors'

const bonusBuyModule = MODULE_CATALOG.find((module) => module.id === 'bonus-buy')!

type MockSlot = {
  id: number
  slotName: string
  nickProvider: string
  purchaseAmount: number
  winAmount: number | null
}

type SessionStats = {
  spent: number
  profit: number
  currentBalance: number
  averageX: number
}

function formatUsd(amount: number | string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(typeof amount === 'string' ? Number.parseFloat(amount) : amount)
}

function formatMultiplier(value: number): string {
  if (value === 0) {
    return '0x'
  }

  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? `${rounded}x` : `${rounded.toFixed(1)}x`
}

function computeStats(startBalance: number, slots: MockSlot[]): SessionStats {
  const spent = slots.reduce((sum, slot) => sum + slot.purchaseAmount, 0)
  const totalWin = slots.reduce(
    (sum, slot) => sum + (slot.winAmount ?? 0),
    0,
  )
  const profit = totalWin - spent
  const currentBalance = startBalance - spent + totalWin
  const averageX = spent > 0 ? totalWin / spent : 0

  return { spent, profit, currentBalance, averageX }
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
  const [record, setRecord] = useState<BonusBuyRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [slots, setSlots] = useState<MockSlot[]>([])
  const [nextSlotId, setNextSlotId] = useState(1)
  const [titleDraft, setTitleDraft] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [startBalanceDraft, setStartBalanceDraft] = useState('')
  const [isEditingStartBalance, setIsEditingStartBalance] = useState(false)
  const [slotName, setSlotName] = useState('')
  const [nickProvider, setNickProvider] = useState('')
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [stubNotice, setStubNotice] = useState<string | null>(null)
  const [endDialogOpen, setEndDialogOpen] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [endError, setEndError] = useState<string | null>(null)

  useSetBreadcrumbLabel(
    record ? `${record.title} #${record.id}` : null,
  )

  const loadRecord = useCallback(async () => {
    if (!user?.accountId || !id) {
      return
    }

    const bonusBuyId = Number.parseInt(id, 10)
    if (!Number.isFinite(bonusBuyId)) {
      setError('Invalid bonus buy id')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const row = await fetchBonusBuy(user.accountId, bonusBuyId)
      setRecord(row)
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
  }, [id, user?.accountId])

  useEffect(() => {
    void loadRecord()
  }, [loadRecord])

  const startBalance = useMemo(() => {
    const parsed = Number.parseFloat(startBalanceDraft)
    return Number.isFinite(parsed) ? parsed : 0
  }, [startBalanceDraft])

  const stats = useMemo(
    () => computeStats(startBalance, slots),
    [startBalance, slots],
  )

  const slotColumns: AppTableColumn<MockSlot>[] = useMemo(
    () => [
      {
        id: 'slotName',
        header: 'Slot',
        width: '100%',
        sx: {
          fontWeight: 500,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
        render: (slot) => slot.slotName,
      },
      {
        id: 'nickProvider',
        header: 'Nick / provider',
        width: 140,
        minWidth: 120,
        sx: {
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
        render: (slot) => slot.nickProvider || '—',
      },
      {
        id: 'purchase',
        header: 'Purchase',
        width: 110,
        minWidth: 100,
        sx: { whiteSpace: 'nowrap' },
        render: (slot) => formatUsd(slot.purchaseAmount),
      },
      {
        id: 'win',
        header: 'Win',
        width: 100,
        minWidth: 90,
        sx: { color: 'text.secondary', whiteSpace: 'nowrap' },
        render: (slot) =>
          slot.winAmount == null ? 'Pending' : formatUsd(slot.winAmount),
      },
      {
        id: 'multiplier',
        header: 'Multiplier',
        width: 100,
        minWidth: 90,
        sx: { color: 'text.secondary', whiteSpace: 'nowrap' },
        render: (slot) =>
          slot.winAmount == null || slot.purchaseAmount === 0
            ? '—'
            : formatMultiplier(slot.winAmount / slot.purchaseAmount),
      },
    ],
    [],
  )

  function showStub(message: string) {
    setStubNotice(message)
  }

  function handleTitleSave() {
    const trimmed = titleDraft.trim()
    if (!trimmed) {
      return
    }

    if (record) {
      setRecord({ ...record, title: trimmed })
    }

    setIsEditingTitle(false)
  }

  function handleStartBalanceSave() {
    const parsed = Number.parseFloat(startBalanceDraft)
    if (!Number.isFinite(parsed) || parsed < 0) {
      return
    }

    setStartBalanceDraft(parsed.toFixed(2))
    if (record) {
      setRecord({ ...record, startBalance: parsed.toFixed(2) })
    }

    setIsEditingStartBalance(false)
  }

  function handleAddSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (!record?.isActive) {
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

    setSlots((current) => [
      ...current,
      {
        id: nextSlotId,
        slotName: trimmedSlot,
        nickProvider: nickProvider.trim(),
        purchaseAmount: parsedPurchase,
        winAmount: null,
      },
    ])
    setNextSlotId((current) => current + 1)
    setSlotName('')
    setPurchaseAmount('')
  }

  function handleEndDialogChange(open: boolean) {
    setEndDialogOpen(open)
    if (!open) {
      setEndError(null)
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
                {isEditingTitle ? (
                  <TextField
                    value={titleDraft}
                    onChange={(event) => setTitleDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleTitleSave()
                      }
                      if (event.key === 'Escape') {
                        setTitleDraft(record.title)
                        setIsEditingTitle(false)
                      }
                    }}
                    onBlur={handleTitleSave}
                    size="small"
                    autoFocus
                    sx={{ ...inputFieldSx, maxWidth: 256 }}
                  />
                ) : (
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
                )}

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

                {!isEditingTitle && record.isActive ? (
                  <IconButton
                    type="button"
                    size="small"
                    aria-label="Edit title"
                    onClick={() => setIsEditingTitle(true)}
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
                  onClick={() => handleEndDialogChange(true)}
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
                onClick={() => showStub('Widget style — coming soon')}
              >
                Widget style
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<Link2 size={16} aria-hidden />}
                onClick={() => showStub('OBS link — coming soon')}
              >
                OBS link
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<ExternalLink size={16} aria-hidden />}
                onClick={() => showStub('Overlay — coming soon')}
              >
                Overlay
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {stubNotice ? (
        <StatusAlert tone="info">{stubNotice}</StatusAlert>
      ) : null}

      {!record.isActive ? (
        <StatusAlert tone="warning">
          This bonus buy session has ended.
        </StatusAlert>
      ) : null}

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            label="Start balance"
            value={formatUsd(startBalance)}
            action={
              isEditingStartBalance ? (
                <TextField
                  value={startBalanceDraft}
                  onChange={(event) => setStartBalanceDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleStartBalanceSave()
                    }
                    if (event.key === 'Escape') {
                      setStartBalanceDraft(record.startBalance)
                      setIsEditingStartBalance(false)
                    }
                  }}
                  onBlur={handleStartBalanceSave}
                  type="number"
                  slotProps={{ htmlInput: { step: '0.01', min: 0, inputMode: 'decimal' } }}
                  size="small"
                  autoFocus
                  sx={{ ...inputFieldSx, width: 96 }}
                />
              ) : record.isActive ? (
                <IconButton
                  type="button"
                  size="small"
                  aria-label="Edit start balance"
                  onClick={() => setIsEditingStartBalance(true)}
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
            valueColor={
              stats.profit >= 0 ? theme.palette.success.main : undefined
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard label="Average X" value={formatMultiplier(stats.averageX)} />
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
                <Box
                  sx={{
                    minWidth: 0,
                    height: 40,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 0.25,
                  }}
                >
                  <Typography
                    noWrap
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      lineHeight: 1.2,
                    }}
                  >
                    Quick add slot
                  </Typography>
                  <Typography
                    noWrap
                    color="text.secondary"
                    sx={{
                      fontSize: '0.6875rem',
                      lineHeight: 1.2,
                    }}
                  >
                    Enter slot details and purchase amount in USD
                  </Typography>
                </Box>
              </Box>
              <Button
                type="submit"
                variant="contained"
                disabled={!record.isActive}
                startIcon={<Plus size={16} aria-hidden />}
                sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' }, flexShrink: 0 }}
              >
                Add slot
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
                    disabled={!record.isActive}
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
                    disabled={!record.isActive}
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
                    disabled={!record.isActive}
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

            {!record.isActive ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1.5, display: 'block' }}
              >
                Session ended — adding new slots is disabled.
              </Typography>
            ) : null}
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
          />
        </CardContent>
      </Card>

      <Dialog
        open={endDialogOpen}
        onClose={() => handleEndDialogChange(false)}
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
          <Button
            type="button"
            variant="outlined"
            onClick={() => handleEndDialogChange(false)}
            disabled={isEnding}
          >
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
