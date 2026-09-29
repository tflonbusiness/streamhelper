import SaveIcon from '@mui/icons-material/Save'
import {
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { PrizeSpinSector } from '@/api/prize-spin'
import { useNotification } from '@/context/NotificationContext'
import { defaultSectorColor } from '@/lib/prize-spin-sector-colors'
import {
  type PrizeSpinSectorDraft,
  validatePrizeSpinSectorDraft,
} from '@/lib/prize-spin-validation'
import { useUpdatePrizeSpinSector } from '@/queries/use-prize-spin-session'

type PrizeSpinSectorInlineEditContextValue = {
  readOnly: boolean
  savingSectorId: number | null
  getDraft: (sector: PrizeSpinSector) => PrizeSpinSectorDraft
  updateDraft: (
    sector: PrizeSpinSector,
    patch: Partial<PrizeSpinSectorDraft>,
  ) => void
  resetDraft: (sector: PrizeSpinSector) => void
  isSectorDirty: (sector: PrizeSpinSector) => boolean
  saveSector: (sector: PrizeSpinSector) => Promise<void>
}

const PrizeSpinSectorInlineEditContext =
  createContext<PrizeSpinSectorInlineEditContextValue | null>(null)

function usePrizeSpinSectorInlineEdit() {
  const context = useContext(PrizeSpinSectorInlineEditContext)
  if (!context) {
    throw new Error(
      'PrizeSpin sector inline cells must be used within PrizeSpinSectorInlineEditProvider',
    )
  }
  return context
}

const InlineField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
  '& .MuiOutlinedInput-input': {
    paddingTop: theme.spacing(0.75),
    paddingBottom: theme.spacing(0.75),
  },
}))

const WinPercentInlineField = styled(InlineField)({
  width: '100%',
  minWidth: 120,
})

function sectorDraft(sector: PrizeSpinSector): PrizeSpinSectorDraft {
  return {
    label: sector.label,
    winPercent: sector.winPercent,
    color: sector.color ?? defaultSectorColor(sector.sortOrder),
  }
}

function draftsMatchSector(
  sector: PrizeSpinSector,
  draft: PrizeSpinSectorDraft,
): boolean {
  const base = sectorDraft(sector)
  return (
    base.label === draft.label.trim() &&
    base.winPercent === draft.winPercent.trim() &&
    base.color.trim().toUpperCase() === draft.color.trim().toUpperCase()
  )
}

type PrizeSpinSectorInlineEditProviderProps = {
  accountId: number
  prizeSpinId: number
  existingTotalWinPercent: number
  sectorsSnapshot: string
  readOnly: boolean
  children: ReactNode
}

export function PrizeSpinSectorInlineEditProvider(
  props: PrizeSpinSectorInlineEditProviderProps,
) {
  const { t } = useTranslation()
  const { showError, showSuccess } = useNotification()
  const [drafts, setDrafts] = useState<Record<number, PrizeSpinSectorDraft>>({})

  useEffect(() => {
    setDrafts({})
  }, [props.sectorsSnapshot])

  const updateMutation = useUpdatePrizeSpinSector(
    props.accountId,
    props.prizeSpinId,
  )

  const savingSectorId =
    updateMutation.isPending && updateMutation.variables
      ? updateMutation.variables.sectorId
      : null

  const getDraft = useCallback(
    (sector: PrizeSpinSector) => drafts[sector.id] ?? sectorDraft(sector),
    [drafts],
  )

  const updateDraft = useCallback(
    (sector: PrizeSpinSector, patch: Partial<PrizeSpinSectorDraft>) => {
      setDrafts((previous) => {
        const current = previous[sector.id] ?? sectorDraft(sector)
        return {
          ...previous,
          [sector.id]: { ...current, ...patch },
        }
      })
    },
    [],
  )

  const resetDraft = useCallback((sector: PrizeSpinSector) => {
    setDrafts((previous) => {
      if (previous[sector.id] === undefined) {
        return previous
      }
      const next = { ...previous }
      delete next[sector.id]
      return next
    })
  }, [])

  const isSectorDirty = useCallback(
    (sector: PrizeSpinSector) => {
      const draft = drafts[sector.id]
      if (!draft) {
        return false
      }
      return !draftsMatchSector(sector, draft)
    },
    [drafts],
  )

  const saveSector = useCallback(
    async (sector: PrizeSpinSector) => {
      const draft = getDraft(sector)
      const normalized: PrizeSpinSectorDraft = {
        label: draft.label.trim(),
        winPercent: draft.winPercent.trim(),
        color: draft.color.trim(),
      }

      if (draftsMatchSector(sector, normalized)) {
        resetDraft(sector)
        return
      }

      const validationError = validatePrizeSpinSectorDraft(normalized, {
        existingTotal: props.existingTotalWinPercent,
        previousPercent: Number.parseFloat(sector.winPercent),
      })
      if (validationError) {
        showError(validationError)
        return
      }

      try {
        await updateMutation.mutateAsync({
          sectorId: sector.id,
          body: {
            label: normalized.label,
            win_percent: normalized.winPercent,
            color: normalized.color,
          },
        })
        resetDraft(sector)
        showSuccess(t('prizeSpin.sectorUpdated'))
      } catch (error) {
        showError(
          error instanceof Error
            ? error.message
            : t('prizeSpin.couldNotUpdateSector'),
        )
      }
    },
    [
      getDraft,
      props.existingTotalWinPercent,
      resetDraft,
      showError,
      showSuccess,
      t,
      updateMutation,
    ],
  )

  const value = useMemo(
    () => ({
      readOnly: props.readOnly,
      savingSectorId,
      getDraft,
      updateDraft,
      resetDraft,
      isSectorDirty,
      saveSector,
    }),
    [
      props.readOnly,
      savingSectorId,
      getDraft,
      updateDraft,
      resetDraft,
      isSectorDirty,
      saveSector,
    ],
  )

  return (
    <PrizeSpinSectorInlineEditContext.Provider value={value}>
      {props.children}
    </PrizeSpinSectorInlineEditContext.Provider>
  )
}

function expandShortHex(hex: string): string {
  const trimmed = hex.trim()
  const shortMatch = /^#([0-9A-Fa-f]{3})$/.exec(trimmed)
  if (shortMatch) {
    const [r, g, b] = shortMatch[1].split('')
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase()
  }
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase()
  }
  return '#000000'
}

function swatchColor(hex: string): string {
  const trimmed = hex.trim()
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed)) {
    return expandShortHex(trimmed)
  }
  return '#2A2A35'
}

type SectorCellProps = {
  sector: PrizeSpinSector
}

function useSectorFieldDisabled(sector: PrizeSpinSector) {
  const { savingSectorId } = usePrizeSpinSectorInlineEdit()
  return savingSectorId === sector.id
}

export function PrizeSpinSectorLabelCell({ sector }: SectorCellProps) {
  const { t } = useTranslation()
  const { readOnly, getDraft, updateDraft, resetDraft, saveSector } =
    usePrizeSpinSectorInlineEdit()
  const disabled = useSectorFieldDisabled(sector)
  const value = getDraft(sector).label

  if (readOnly) {
    return (
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {sector.label}
      </Typography>
    )
  }

  return (
    <InlineField
      value={value}
      onChange={(event) =>
        updateDraft(sector, { label: event.target.value })
      }
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          void saveSector(sector)
        }
        if (event.key === 'Escape') {
          resetDraft(sector)
          event.currentTarget.blur()
        }
      }}
      size="small"
      fullWidth
      disabled={disabled}
      aria-label={t('table.editSectorAria', { label: sector.label })}
    />
  )
}

export function PrizeSpinSectorWinPercentCell({ sector }: SectorCellProps) {
  const { t } = useTranslation()
  const { readOnly, getDraft, updateDraft, resetDraft, saveSector } =
    usePrizeSpinSectorInlineEdit()
  const disabled = useSectorFieldDisabled(sector)
  const value = getDraft(sector).winPercent

  if (readOnly) {
    return `${sector.winPercent}%`
  }

  return (
    <WinPercentInlineField
      value={value}
      onChange={(event) =>
        updateDraft(sector, { winPercent: event.target.value })
      }
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          void saveSector(sector)
        }
        if (event.key === 'Escape') {
          resetDraft(sector)
          event.currentTarget.blur()
        }
      }}
      size="small"
      type="number"
      disabled={disabled}
      slotProps={{
        htmlInput: { min: 0.01, max: 100, step: 0.01 },
        input: {
          endAdornment: <InputAdornment position="end">%</InputAdornment>,
        },
      }}
      aria-label={t('common.winPercent')}
    />
  )
}

export function PrizeSpinSectorColorCell({ sector }: SectorCellProps) {
  const { t } = useTranslation()
  const { readOnly, getDraft, updateDraft } = usePrizeSpinSectorInlineEdit()
  const disabled = useSectorFieldDisabled(sector)
  const baseColor = sector.color ?? defaultSectorColor(sector.sortOrder)
  const value = getDraft(sector).color

  if (readOnly) {
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          width: 24,
          height: 24,
          borderRadius: 1,
          bgcolor: swatchColor(baseColor),
          border: '1px solid',
          borderColor: 'divider',
        }}
        aria-hidden
      />
    )
  }

  const pickerValue = expandShortHex(value)
  const displaySwatch = swatchColor(value)

  return (
    <Box
      component="label"
      sx={{
        position: 'relative',
        display: 'inline-flex',
        width: 28,
        height: 28,
        borderRadius: 1,
        bgcolor: displaySwatch,
        border: '1px solid',
        borderColor: 'divider',
        cursor: disabled ? 'default' : 'pointer',
        overflow: 'hidden',
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Box
        component="input"
        type="color"
        value={pickerValue}
        disabled={disabled}
        onChange={(event) => {
          updateDraft(sector, {
            color: event.target.value.toUpperCase(),
          })
        }}
        aria-label={t('common.color')}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: disabled ? 'default' : 'pointer',
          border: 'none',
          p: 0,
        }}
      />
    </Box>
  )
}

export function PrizeSpinSectorSaveButton({ sector }: SectorCellProps) {
  const { t } = useTranslation()
  const { readOnly, savingSectorId, isSectorDirty, saveSector } =
    usePrizeSpinSectorInlineEdit()

  if (readOnly) {
    return null
  }

  const pending = savingSectorId === sector.id
  const dirty = isSectorDirty(sector)

  const active = dirty && !pending

  return (
    <IconButton
      type="button"
      size="small"
      disabled={!dirty || pending}
      aria-label={t('table.saveSectorAria', { label: sector.label })}
      onClick={() => void saveSector(sector)}
      sx={
        active
          ? {
              color: 'warning.main',
              '&:hover': { bgcolor: 'action.hover', color: 'warning.dark' },
            }
          : undefined
      }
    >
      {pending ? (
        <CircularProgress size={18} aria-hidden />
      ) : (
        <SaveIcon fontSize="small" aria-hidden />
      )}
    </IconButton>
  )
}
