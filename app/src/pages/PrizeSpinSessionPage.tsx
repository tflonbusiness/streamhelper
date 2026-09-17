import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
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
import { alpha, useTheme } from '@mui/material/styles'
import {
  Archive,
  BarChart3,
  CircleStop,
  Download,
  Equal,
  ExternalLink,
  History,
  Link2,
  PieChart,
  Pencil,
  Plus,
  Trash2,
  UserRound,
} from 'lucide-react'
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  createPrizeSpinSector,
  distributePrizeSpinSectorsEqually,
  deletePrizeSpinSector,
  deleteAllPrizeSpinWins,
  deletePrizeSpinWin,
  endPrizeSpin,
  fetchPrizeSpin,
  fetchPrizeSpinSectors,
  fetchPrizeSpinWins,
  spinPrizeSpin,
  updatePrizeSpinSector,
  type PrizeSpinRecord,
  type PrizeSpinSector,
  type PrizeSpinWin,
} from '@/api/prize-spin'
import { AppTable, type AppTableColumn } from '@/components/AppTable'
import { IconTile } from '@/components/IconTile'
import { HexColorField } from '@/components/bonus-buy/HexColorField'
import { PageHeader } from '@/components/PageHeader'
import { StatusAlert, type StatusAlertTone } from '@/components/StatusAlert'
import { useAuth } from '@/context/AuthContext'
import { useSetBreadcrumbLabel } from '@/context/BreadcrumbContext'
import { useNotification } from '@/context/NotificationContext'
import { defaultSectorColor } from '@/lib/prize-spin-sector-colors'
import { downloadWinnersXlsx } from '@/lib/prize-spin-winners-export'
import {
  validateParticipantNick,
  validatePrizeSpinSectorDraft,
} from '@/lib/prize-spin-validation'
import { MODULE_CATALOG } from '@/lib/modules'
import { cardSx, inputFieldSx, mutedChipSx } from '@/theme/colors'

const prizeSpinModule = MODULE_CATALOG.find((module) => module.id === 'prize-spin')!

const cardSectionDividerSx = { mx: -3, my: 2 }

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function sumWinPercent(sectors: PrizeSpinSector[]): number {
  return sectors.reduce(
    (total, sector) => total + Number.parseFloat(sector.winPercent),
    0,
  )
}

function isCompleteWinPercentTotal(total: number): boolean {
  return Number(total.toFixed(2)) === 100
}

function TruncatedText({ text }: { text: string }) {
  return (
    <Tooltip title={text} placement="top" enterDelay={400}>
      <Typography
        component="span"
        variant="inherit"
        noWrap
        sx={{
          display: 'block',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {text}
      </Typography>
    </Tooltip>
  )
}

type WinnerSectorStat = {
  sectorId: number
  label: string
  color: string | null
  count: number
  actualPercent: number
}

function buildWinnerSectorStats(
  wins: PrizeSpinWin[],
  sectors: PrizeSpinSector[],
): { total: number; rows: WinnerSectorStat[] } {
  const activeSectorIds = new Set(sectors.map((sector) => sector.id))
  const activeWins = wins.filter((win) => activeSectorIds.has(win.sectorId))
  const total = activeWins.length
  const counts = new Map<number, number>()

  for (const win of activeWins) {
    counts.set(win.sectorId, (counts.get(win.sectorId) ?? 0) + 1)
  }

  const rows = sectors.map((sector) => {
    const count = counts.get(sector.id) ?? 0

    return {
      sectorId: sector.id,
      label: sector.label,
      color: sector.color,
      count,
      actualPercent: total > 0 ? (count / total) * 100 : 0,
    }
  })

  rows.sort(
    (left, right) =>
      right.count - left.count || left.label.localeCompare(right.label),
  )

  return { total, rows }
}

function PrizeSpinStatsCard({
  wins,
  sectors,
}: {
  wins: PrizeSpinWin[]
  sectors: PrizeSpinSector[]
}) {
  const theme = useTheme()
  const { total, rows } = useMemo(
    () => buildWinnerSectorStats(wins, sectors),
    [wins, sectors],
  )

  return (
    <Card elevation={0} sx={cardSx}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <IconTile icon={BarChart3} variant="info" size="sm" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Stats
            </Typography>
          </Stack>
          <Chip
            label={`${total} total roll${total === 1 ? '' : 's'}`}
            size="small"
            sx={mutedChipSx(theme)}
          />
        </Stack>
        <Divider sx={cardSectionDividerSx} />
        {rows.length > 0 ? (
          <Stack spacing={1.5}>
            {rows.map((row) => (
              <Stack
                key={row.sectorId}
                direction="row"
                spacing={1}
                sx={{ alignItems: 'flex-start', minWidth: 0 }}
              >
                <ColorSwatch color={row.color} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      minWidth: 0,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                      <TruncatedText text={row.label} />
                    </Box>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{ flexShrink: 0, alignItems: 'baseline' }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        {row.count}{' '}
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          ({row.actualPercent.toFixed(1)}%)
                        </Typography>
                      </Typography>
                    </Stack>
                  </Stack>
                  <Box
                    sx={{
                      mt: 0.5,
                      height: 3,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.info.main, 0.15),
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${row.actualPercent}%`,
                        borderRadius: 1,
                        bgcolor: theme.palette.info.main,
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </Box>
                </Box>
              </Stack>
            ))}
          </Stack>
        ) : (
          <StatusAlert tone="info">
            Add wheel sectors to see drop statistics.
          </StatusAlert>
        )}
      </CardContent>
    </Card>
  )
}

function WinnerExpandedDetails({ win }: { win: PrizeSpinWin }) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
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
          Time
        </Typography>
        <Typography variant="body2">{formatDateTime(win.createdAt)}</Typography>
      </Grid>
    </Grid>
  )
}

function ColorSwatch({ color }: { color: string | null }) {
  return (
    <Box
      sx={{
        width: 20,
        height: 20,
        borderRadius: 0.5,
        bgcolor: color ?? 'action.disabledBackground',
        border: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
      }}
    />
  )
}

export function PrizeSpinSessionPage() {
  const theme = useTheme()
  const { id } = useParams()
  const prizeSpinId = Number.parseInt(id ?? '', 10)
  const { user } = useAuth()
  const { showSuccess, showError } = useNotification()

  const [record, setRecord] = useState<PrizeSpinRecord | null>(null)
  const [sectors, setSectors] = useState<PrizeSpinSector[]>([])
  const [wins, setWins] = useState<PrizeSpinWin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [participantNick, setParticipantNick] = useState('')
  const [spinError, setSpinError] = useState<string | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)

  const [addSectorDialogOpen, setAddSectorDialogOpen] = useState(false)
  const [sectorLabel, setSectorLabel] = useState('')
  const [sectorWinPercent, setSectorWinPercent] = useState('')
  const [sectorColor, setSectorColor] = useState(defaultSectorColor(0))
  const [sectorFormError, setSectorFormError] = useState<string | null>(null)
  const [isAddingSector, setIsAddingSector] = useState(false)
  const [isDistributingSectors, setIsDistributingSectors] = useState(false)

  const [editSector, setEditSector] = useState<PrizeSpinSector | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editWinPercent, setEditWinPercent] = useState('')
  const [editColor, setEditColor] = useState('#F59E0B')
  const [editError, setEditError] = useState<string | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const [expandedWinnerIds, setExpandedWinnerIds] = useState<Set<number>>(
    new Set(),
  )

  const [archiveAllDialogOpen, setArchiveAllDialogOpen] = useState(false)
  const [isArchivingAll, setIsArchivingAll] = useState(false)
  const [archiveAllError, setArchiveAllError] = useState<string | null>(null)
  const [isExportingWinners, setIsExportingWinners] = useState(false)
  const [exportWinnersError, setExportWinnersError] = useState<string | null>(null)

  const [endDialogOpen, setEndDialogOpen] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [endError, setEndError] = useState<string | null>(null)

  useSetBreadcrumbLabel(record ? `${record.title} #${record.id}` : null)

  const totalWinPercent = useMemo(() => sumWinPercent(sectors), [sectors])
  const isWinPercentComplete = isCompleteWinPercentTotal(totalWinPercent)
  const canSpin =
    participantNick.trim().length > 0 &&
    sectors.length >= 2 &&
    isWinPercentComplete &&
    !isSpinning

  const spinReadiness = useMemo(() => {
    const messages: string[] = []

    if (isSpinning) {
      messages.push('Spin in progress…')
    }
    if (participantNick.trim().length === 0) {
      messages.push('Enter a participant nick to enable spin.')
    }
    if (sectors.length < 2) {
      messages.push('Add at least 2 wheel sectors before spinning.')
    }
    if (!isCompleteWinPercentTotal(totalWinPercent)) {
      messages.push('Sector win percentages must total 100% before spinning.')
    }

    if (messages.length === 0) {
      return {
        tone: 'success' as const,
        messages: ['Ready to spin for this viewer.'],
      }
    }

    const hasValidationIssue =
      participantNick.trim().length === 0 ||
      sectors.length < 2 ||
      !isCompleteWinPercentTotal(totalWinPercent)
    const tone: StatusAlertTone = hasValidationIssue ? 'warning' : 'info'

    return {
      tone,
      messages,
    }
  }, [isSpinning, participantNick, sectors.length, totalWinPercent])

  const loadSession = useCallback(async () => {
    if (!user?.accountId || !Number.isFinite(prizeSpinId)) {
      setLoading(false)
      setError('Session not found')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [row, sectorRows, winRows] = await Promise.all([
        fetchPrizeSpin(user.accountId, prizeSpinId),
        fetchPrizeSpinSectors(user.accountId, prizeSpinId),
        fetchPrizeSpinWins(user.accountId, prizeSpinId),
      ])
      setRecord(row)
      setSectors(sectorRows)
      setWins(winRows)
      setSectorColor(defaultSectorColor(sectorRows.length))
    } catch (loadError) {
      setRecord(null)
      setSectors([])
      setWins([])
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Could not load prize spin session',
      )
    } finally {
      setLoading(false)
    }
  }, [prizeSpinId, user?.accountId])

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  async function handleSpin() {
    if (!user?.accountId || isSpinning) {
      return
    }

    const nickError = validateParticipantNick(participantNick)
    if (nickError) {
      setSpinError(nickError)
      return
    }
    if (!canSpin) {
      return
    }

    setIsSpinning(true)
    setSpinError(null)

    try {
      const win = await spinPrizeSpin(
        user.accountId,
        prizeSpinId,
        participantNick.trim(),
      )
      setWins((previous) => [win, ...previous])
      setParticipantNick('')
      showSuccess(`Winner: ${win.participantNick} — ${win.sectorLabel}`)
    } catch (spinFailure) {
      setSpinError(
        spinFailure instanceof Error
          ? spinFailure.message
          : 'Could not spin prize wheel',
      )
    } finally {
      setIsSpinning(false)
    }
  }

  function resetAddSectorForm(nextColorIndex = sectors.length) {
    setSectorLabel('')
    setSectorWinPercent('')
    setSectorColor(defaultSectorColor(nextColorIndex))
    setSectorFormError(null)
  }

  function openAddSectorDialog() {
    resetAddSectorForm()
    setAddSectorDialogOpen(true)
  }

  function closeAddSectorDialog() {
    setAddSectorDialogOpen(false)
    resetAddSectorForm()
  }

  async function handleAddSector(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user?.accountId) {
      return
    }

    const validationError = validatePrizeSpinSectorDraft(
      {
        label: sectorLabel,
        winPercent: sectorWinPercent,
        color: sectorColor,
      },
      { existingTotal: totalWinPercent },
    )
    if (validationError) {
      setSectorFormError(validationError)
      return
    }

    setIsAddingSector(true)
    setSectorFormError(null)

    try {
      const created = await createPrizeSpinSector(
        user.accountId,
        prizeSpinId,
        sectorLabel,
        sectorWinPercent,
        sectorColor,
      )
      setSectors((previous) => [...previous, created])
      setAddSectorDialogOpen(false)
      resetAddSectorForm(sectors.length + 1)
      showSuccess('Sector added.')
    } catch (addError) {
      setSectorFormError(
        addError instanceof Error ? addError.message : 'Could not add sector',
      )
    } finally {
      setIsAddingSector(false)
    }
  }

  function openEditDialog(sector: PrizeSpinSector) {
    setEditSector(sector)
    setEditLabel(sector.label)
    setEditWinPercent(sector.winPercent)
    setEditColor(sector.color ?? defaultSectorColor(sector.sortOrder))
    setEditError(null)
  }

  function closeEditDialog() {
    setEditSector(null)
    setEditError(null)
  }

  async function handleSaveEdit() {
    if (!user?.accountId || !editSector) {
      return
    }

    const validationError = validatePrizeSpinSectorDraft(
      {
        label: editLabel,
        winPercent: editWinPercent,
        color: editColor,
      },
      {
        existingTotal: totalWinPercent,
        previousPercent: Number.parseFloat(editSector.winPercent),
      },
    )

    if (validationError) {
      setEditError(validationError)
      return
    }

    setIsSavingEdit(true)
    setEditError(null)

    try {
      const updated = await updatePrizeSpinSector(
        user.accountId,
        prizeSpinId,
        editSector.id,
        {
          label: editLabel,
          win_percent: editWinPercent,
          color: editColor,
        },
      )
      setSectors((previous) =>
        previous.map((sector) =>
          sector.id === updated.id ? updated : sector,
        ),
      )
      closeEditDialog()
      showSuccess('Sector updated.')
    } catch (saveError) {
      setEditError(
        saveError instanceof Error ? saveError.message : 'Could not update sector',
      )
    } finally {
      setIsSavingEdit(false)
    }
  }

  async function handleDeleteSector(sectorId: number) {
    if (!user?.accountId) {
      return
    }

    try {
      await deletePrizeSpinSector(user.accountId, prizeSpinId, sectorId)
      setSectors((previous) => previous.filter((sector) => sector.id !== sectorId))
      showSuccess('Sector removed.')
    } catch (deleteError) {
      showError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not delete sector',
      )
    }
  }

  async function handleDistributeSectorsEqually() {
    if (!user?.accountId || sectors.length === 0) {
      return
    }

    setIsDistributingSectors(true)

    try {
      const updated = await distributePrizeSpinSectorsEqually(
        user.accountId,
        prizeSpinId,
      )
      setSectors(updated)
      showSuccess('Sector weights split evenly to 100%.')
    } catch (distributeError) {
      showError(
        distributeError instanceof Error
          ? distributeError.message
          : 'Could not distribute sector weights',
      )
    } finally {
      setIsDistributingSectors(false)
    }
  }

  async function handleDeleteWin(winId: number) {
    if (!user?.accountId) {
      return
    }

    try {
      await deletePrizeSpinWin(user.accountId, prizeSpinId, winId)
      setWins((previous) => previous.filter((win) => win.id !== winId))
      showSuccess('Winner removed.')
    } catch (deleteError) {
      showError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not remove winner',
      )
    }
  }

  function handleDownloadWinners() {
    if (wins.length === 0 || isExportingWinners) {
      return
    }

    setIsExportingWinners(true)
    setExportWinnersError(null)

    try {
      downloadWinnersXlsx(wins, prizeSpinId)
      showSuccess('Winners exported.')
    } catch (exportError) {
      const message =
        exportError instanceof Error
          ? exportError.message
          : 'Could not export winners'
      setExportWinnersError(message)
      showError(message)
    } finally {
      setIsExportingWinners(false)
    }
  }

  async function handleArchiveAllWinners() {
    if (!user?.accountId || wins.length === 0) {
      return
    }

    setIsArchivingAll(true)
    setArchiveAllError(null)

    try {
      await deleteAllPrizeSpinWins(user.accountId, prizeSpinId)
      setWins([])
      setArchiveAllDialogOpen(false)
      showSuccess('All winners archived.')
    } catch (archiveError) {
      setArchiveAllError(
        archiveError instanceof Error
          ? archiveError.message
          : 'Could not archive winners',
      )
    } finally {
      setIsArchivingAll(false)
    }
  }

  async function handleEndSession() {
    if (!user?.accountId || !record) {
      return
    }

    setIsEnding(true)
    setEndError(null)

    try {
      const updated = await endPrizeSpin(user.accountId, record.id)
      setRecord(updated)
      setEndDialogOpen(false)
      showSuccess('Prize spin session ended.')
    } catch (endSessionError) {
      setEndError(
        endSessionError instanceof Error
          ? endSessionError.message
          : 'Could not end prize spin session',
      )
    } finally {
      setIsEnding(false)
    }
  }

  function showStub(message: string) {
    showSuccess(message)
  }

  const sectorColumns: AppTableColumn<PrizeSpinSector>[] = [
    {
      id: 'color',
      header: '',
      width: 40,
      minWidth: 40,
      sx: { px: 1 },
      render: (sector) => <ColorSwatch color={sector.color} />,
    },
    {
      id: 'label',
      header: 'Label',
      width: '100%',
      sx: { fontWeight: 500 },
      render: (sector) => sector.label,
    },
    {
      id: 'winPercent',
      header: 'Win %',
      width: 88,
      minWidth: 88,
      sx: { whiteSpace: 'nowrap' },
      render: (sector) => `${sector.winPercent}%`,
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      width: 88,
      minWidth: 88,
      render: (sector) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          <IconButton
            type="button"
            size="small"
            aria-label={`Edit ${sector.label}`}
            onClick={() => openEditDialog(sector)}
          >
            <Pencil size={16} aria-hidden />
          </IconButton>
          <IconButton
            type="button"
            size="small"
            aria-label={`Delete ${sector.label}`}
            onClick={() => void handleDeleteSector(sector.id)}
            sx={{ color: theme.palette.error.main }}
          >
            <Trash2 size={16} aria-hidden />
          </IconButton>
        </Stack>
      ),
    },
  ]

  function toggleWinnerExpanded(winId: number) {
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

  const winnerColumns: AppTableColumn<PrizeSpinWin>[] = [
    {
      id: 'nick',
      header: 'Nick',
      width: '50%',
      sx: {
        fontWeight: 500,
        minWidth: 0,
        maxWidth: 0,
        overflow: 'hidden',
      },
      render: (win) => <TruncatedText text={win.participantNick} />,
    },
    {
      id: 'prize',
      header: 'Prize',
      width: '50%',
      sx: {
        minWidth: 0,
        maxWidth: 0,
        overflow: 'hidden',
      },
      render: (win) => <TruncatedText text={win.sectorLabel} />,
    },
    {
      id: 'action',
      header: '',
      align: 'right',
      width: 56,
      minWidth: 56,
      render: (win) => (
        <IconButton
          type="button"
          size="small"
          aria-label={`Remove ${win.participantNick}`}
          onClick={() => void handleDeleteWin(win.id)}
          sx={{ color: theme.palette.error.main }}
        >
          <Trash2 size={16} aria-hidden />
        </IconButton>
      ),
    },
  ]

  if (loading) {
    return (
      <Stack spacing={4}>
        <PageHeader
          title={prizeSpinModule.name}
          description={prizeSpinModule.description}
          icon={prizeSpinModule.icon}
          iconVariant={prizeSpinModule.iconVariant}
        />
        <Skeleton variant="rounded" height={64} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Stack spacing={3}>
              <Skeleton variant="rounded" height={120} />
              <Skeleton variant="rounded" height={280} />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Stack spacing={3}>
              <Skeleton variant="rounded" height={160} />
              <Skeleton variant="rounded" height={280} />
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    )
  }

  if (error || !record) {
    return (
      <Stack spacing={4}>
        <PageHeader
          title={prizeSpinModule.name}
          description={prizeSpinModule.description}
          icon={prizeSpinModule.icon}
          iconVariant={prizeSpinModule.iconVariant}
        />
        <StatusAlert tone="error">{error ?? 'Session not found'}</StatusAlert>
        <Button component={Link} to="/prize-spin" variant="outlined">
          Back to history
        </Button>
      </Stack>
    )
  }

  return (
    <Stack spacing={4}>
      <PageHeader
        title={prizeSpinModule.name}
        description={prizeSpinModule.description}
        icon={prizeSpinModule.icon}
        iconVariant={prizeSpinModule.iconVariant}
      />

      <Card elevation={0} sx={cardSx}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={2}
            sx={{ alignItems: { lg: 'center' }, justifyContent: 'space-between' }}
          >
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
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
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
                component={Link}
                to={id ? `/prize-spin/${id}/widget` : '/prize-spin'}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="small"
                startIcon={<ExternalLink size={16} aria-hidden />}
              >
                Overlay
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<Download size={16} aria-hidden />}
                disabled={wins.length === 0 || isExportingWinners}
                onClick={handleDownloadWinners}
              >
                {isExportingWinners ? 'Downloading…' : 'Download History'}
              </Button>
              {record.isActive ? (
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<CircleStop size={16} aria-hidden />}
                  onClick={() => {
                    setEndError(null)
                    setEndDialogOpen(true)
                  }}
                  sx={{
                    borderColor: alpha(theme.palette.error.main, 0.4),
                    color: theme.palette.error.main,
                    '&:hover': {
                      borderColor: theme.palette.error.main,
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                    },
                  }}
                >
                  End session
                </Button>
              ) : null}
            </Stack>
          </Stack>
          {exportWinnersError ? (
            <StatusAlert tone="error" sx={{ mt: 2 }}>
              {exportWinnersError}
            </StatusAlert>
          ) : null}
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={3}>
            <Card elevation={0} sx={cardSx}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center' }}
                >
                  <IconTile icon={UserRound} variant="purple" size="sm" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Spin For Viewer
                  </Typography>
                </Stack>
                <Divider sx={cardSectionDividerSx} />
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  sx={{ alignItems: { sm: 'flex-start' } }}
                >
                  <TextField
                    label="Participant nick"
                    placeholder="Viewer chat nick"
                    value={participantNick}
                    onChange={(event) => setParticipantNick(event.target.value)}
                    fullWidth
                    size="small"
                    sx={inputFieldSx}
                  />
                  <Button
                    type="button"
                    variant="contained"
                    disabled={!canSpin}
                    onClick={() => void handleSpin()}
                    sx={{ flexShrink: 0, minWidth: { sm: 120 } }}
                  >
                    {isSpinning ? 'Spinning…' : 'Spin'}
                  </Button>
                </Stack>
                <StatusAlert tone={spinReadiness.tone} sx={{ mt: 2 }}>
                  {spinReadiness.messages.length === 1 ? (
                    spinReadiness.messages[0]
                  ) : (
                    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                      {spinReadiness.messages.map((message) => (
                        <Typography component="li" variant="body2" key={message}>
                          {message}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </StatusAlert>
                {spinError ? (
                  <StatusAlert tone="error" sx={{ mt: 2 }}>
                    {spinError}
                  </StatusAlert>
                ) : null}
              </CardContent>
            </Card>

            <Card elevation={0} sx={cardSx}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                    <IconTile icon={PieChart} variant="purple" size="sm" />
                    <Stack>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Wheel Sectors ({sectors.length})
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      startIcon={<Equal size={16} aria-hidden />}
                      disabled={sectors.length === 0 || isDistributingSectors}
                      onClick={() => void handleDistributeSectorsEqually()}
                    >
                      {isDistributingSectors ? 'Splitting…' : 'Split 100%'}
                    </Button>
                    <Button
                      type="button"
                      variant="contained"
                      size="small"
                      startIcon={<Plus size={16} aria-hidden />}
                      onClick={openAddSectorDialog}
                    >
                      Add sector
                    </Button>
                  </Stack>
                </Stack>
                <Divider sx={cardSectionDividerSx} />

                {sectors.length > 0 ? (
                  <AppTable
                    columns={sectorColumns}
                    rows={sectors}
                    getRowKey={(sector) => sector.id}
                  />
                ) : (
                  <StatusAlert tone="info">
                    No sectors yet. Use Add sector to create at least two.
                  </StatusAlert>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3}>
            <PrizeSpinStatsCard wins={wins} sectors={sectors} />

            <Card elevation={0} sx={cardSx}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <IconTile icon={History} variant="warning" size="sm" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      History ({wins.length})
                    </Typography>
                  </Stack>
                  {wins.length > 0 ? (
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      startIcon={<Archive size={16} aria-hidden />}
                      onClick={() => {
                        setArchiveAllError(null)
                        setArchiveAllDialogOpen(true)
                      }}
                      sx={{
                        borderColor: alpha(theme.palette.error.main, 0.4),
                        color: theme.palette.error.main,
                        '&:hover': {
                          borderColor: theme.palette.error.main,
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                        },
                      }}
                    >
                      Archive all
                    </Button>
                  ) : null}
                </Stack>
                <Divider sx={cardSectionDividerSx} />

                {wins.length > 0 ? (
                  <AppTable
                    columns={winnerColumns}
                    rows={wins}
                    getRowKey={(win) => win.id}
                    expandable={{
                      isExpanded: (win) => expandedWinnerIds.has(win.id),
                      onToggle: (win) => toggleWinnerExpanded(win.id),
                      ariaLabel: (win) =>
                        expandedWinnerIds.has(win.id)
                          ? `Collapse details for ${win.participantNick}`
                          : `Expand details for ${win.participantNick}`,
                      renderDetail: (win) => <WinnerExpandedDetails win={win} />,
                    }}
                  />
                ) : (
                  <StatusAlert tone="info">No winners yet.</StatusAlert>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Dialog
        open={archiveAllDialogOpen}
        onClose={() => setArchiveAllDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Archive all winners?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This removes all {wins.length} winner{wins.length === 1 ? '' : 's'} from
            the list. Archived records stay in the database.
          </Typography>
          {archiveAllError ? (
            <StatusAlert tone="error" sx={{ mt: 2 }}>
              {archiveAllError}
            </StatusAlert>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => setArchiveAllDialogOpen(false)}
            disabled={isArchivingAll}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="contained"
            color="error"
            onClick={() => void handleArchiveAllWinners()}
            disabled={isArchivingAll}
          >
            {isArchivingAll ? 'Archiving…' : 'Archive all'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={addSectorDialogOpen}
        onClose={closeAddSectorDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add sector</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            id="prize-spin-add-sector-form"
            onSubmit={handleAddSector}
          >
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                label="Label"
                placeholder="Prize label"
                value={sectorLabel}
                onChange={(event) => setSectorLabel(event.target.value)}
                required
                autoFocus
                fullWidth
                size="small"
                sx={inputFieldSx}
              />
              <TextField
                label="Win %"
                placeholder="Win chance (%)"
                value={sectorWinPercent}
                onChange={(event) => setSectorWinPercent(event.target.value)}
                required
                type="number"
                slotProps={{
                  htmlInput: { min: 0.01, max: 100, step: 0.01 },
                }}
                fullWidth
                size="small"
                sx={inputFieldSx}
              />
              <HexColorField
                label="Color"
                value={sectorColor}
                onChange={setSectorColor}
              />
              {sectorFormError ? (
                <StatusAlert tone="error">{sectorFormError}</StatusAlert>
              ) : null}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={closeAddSectorDialog}
            disabled={isAddingSector}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="prize-spin-add-sector-form"
            variant="contained"
            disabled={isAddingSector}
          >
            {isAddingSector ? 'Adding…' : 'Add sector'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editSector !== null}
        onClose={closeEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit sector</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Label"
              value={editLabel}
              onChange={(event) => setEditLabel(event.target.value)}
              required
              fullWidth
              size="small"
              sx={inputFieldSx}
            />
            <TextField
              label="Win %"
              value={editWinPercent}
              onChange={(event) => setEditWinPercent(event.target.value)}
              required
              type="number"
              slotProps={{
                htmlInput: { min: 0.01, max: 100, step: 0.01 },
              }}
              fullWidth
              size="small"
              sx={inputFieldSx}
            />
            <HexColorField
              label="Color"
              value={editColor}
              onChange={setEditColor}
            />
            {editError ? <StatusAlert tone="error">{editError}</StatusAlert> : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={closeEditDialog}
            disabled={isSavingEdit}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={() => void handleSaveEdit()}
            disabled={isSavingEdit}
          >
            {isSavingEdit ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={endDialogOpen}
        onClose={() => setEndDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>End prize spin session?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This marks the session as inactive. You can still open it from history.
          </Typography>
          {endError ? (
            <StatusAlert tone="error" sx={{ mt: 2 }}>
              {endError}
            </StatusAlert>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => setEndDialogOpen(false)}
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
