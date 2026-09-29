import SaveIcon from '@mui/icons-material/Save'
import { CircularProgress, IconButton, TextField } from '@mui/material'
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
import type { BonusBuySlot } from '@/api/bonus-buy'
import { isBonusBuySlotPlaying } from '@/api/bonus-buy'
import { buildBonusBuyMoneyInputSlotProps } from '@/components/bonus-buy/bonus-buy-money-input'
import { useNotification } from '@/context/NotificationContext'
import { sanitizeDecimalInput } from '@/lib/bonus-buy-format'
import {
  type BonusBuySlotDraft,
  validateEditBonusBuySlotMoneyDraft,
} from '@/lib/bonus-buy-validation'
import { usePatchBonusBuySlot } from '@/queries/use-bonus-buy'

type BonusBuySlotInlineEditContextValue = {
  currencyCode: string
  savingSlotId: number | null
  getDraft: (slot: BonusBuySlot) => BonusBuySlotDraft
  updateDraft: (slot: BonusBuySlot, patch: Partial<BonusBuySlotDraft>) => void
  resetDraft: (slot: BonusBuySlot) => void
  isSlotDirty: (slot: BonusBuySlot) => boolean
  saveSlot: (slot: BonusBuySlot) => Promise<void>
}

const BonusBuySlotInlineEditContext =
  createContext<BonusBuySlotInlineEditContextValue | null>(null)

function useBonusBuySlotInlineEdit() {
  const context = useContext(BonusBuySlotInlineEditContext)
  if (!context) {
    throw new Error(
      'Bonus buy slot inline cells must be used within BonusBuySlotInlineEditProvider',
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

const MoneyInlineField = styled(InlineField)({
  width: 152,
  minWidth: 112,
  maxWidth: 152,
})

function slotDraft(slot: BonusBuySlot): BonusBuySlotDraft {
  return {
    name: slot.name,
    providerName: slot.providerName ?? '',
    purchaseAmount: slot.purchaseAmount,
    winAmount: slot.winAmount ?? '',
  }
}

function normalizeDraft(draft: BonusBuySlotDraft): BonusBuySlotDraft {
  return {
    name: draft.name.trim(),
    providerName: draft.providerName.trim(),
    purchaseAmount: draft.purchaseAmount.trim(),
    winAmount: draft.winAmount.trim(),
  }
}

function draftsMatchSlot(slot: BonusBuySlot, draft: BonusBuySlotDraft): boolean {
  const base = slotDraft(slot)
  const normalized = normalizeDraft(draft)
  return (
    base.purchaseAmount === normalized.purchaseAmount &&
    base.winAmount === normalized.winAmount
  )
}

type BonusBuySlotInlineEditProviderProps = {
  accountId: number
  bonusBuyId: number
  currencyCode: string
  slotsSnapshot: string
  children: ReactNode
}

export function BonusBuySlotInlineEditProvider(
  props: BonusBuySlotInlineEditProviderProps,
) {
  const { t } = useTranslation()
  const { showError, showSuccess } = useNotification()
  const [drafts, setDrafts] = useState<Record<number, BonusBuySlotDraft>>({})

  useEffect(() => {
    setDrafts({})
  }, [props.slotsSnapshot])

  const patchSlotMutation = usePatchBonusBuySlot(
    props.accountId,
    props.bonusBuyId,
  )

  const savingSlotId =
    patchSlotMutation.isPending && patchSlotMutation.variables
      ? patchSlotMutation.variables.slotId
      : null

  const getDraft = useCallback(
    (slot: BonusBuySlot) => drafts[slot.id] ?? slotDraft(slot),
    [drafts],
  )

  const updateDraft = useCallback(
    (slot: BonusBuySlot, patch: Partial<BonusBuySlotDraft>) => {
      setDrafts((previous) => {
        const current = previous[slot.id] ?? slotDraft(slot)
        return {
          ...previous,
          [slot.id]: { ...current, ...patch },
        }
      })
    },
    [],
  )

  const resetDraft = useCallback((slot: BonusBuySlot) => {
    setDrafts((previous) => {
      if (previous[slot.id] === undefined) {
        return previous
      }
      const next = { ...previous }
      delete next[slot.id]
      return next
    })
  }, [])

  const isSlotDirty = useCallback(
    (slot: BonusBuySlot) => {
      const draft = drafts[slot.id]
      if (!draft) {
        return false
      }
      return !draftsMatchSlot(slot, draft)
    },
    [drafts],
  )

  const saveSlot = useCallback(
    async (slot: BonusBuySlot) => {
      const draft = normalizeDraft(getDraft(slot))

      if (draftsMatchSlot(slot, draft)) {
        resetDraft(slot)
        return
      }

      const validationError = validateEditBonusBuySlotMoneyDraft({
        purchaseAmount: draft.purchaseAmount,
        winAmount: draft.winAmount,
      })
      if (validationError) {
        showError(validationError)
        return
      }

      const trimmedWin = draft.winAmount

      try {
        await patchSlotMutation.mutateAsync({
          slotId: slot.id,
          body: {
            purchase_amount: Number.parseFloat(draft.purchaseAmount).toFixed(2),
            win_amount: trimmedWin
              ? Number.parseFloat(trimmedWin).toFixed(2)
              : null,
            status: isBonusBuySlotPlaying(slot) ? 'playing' : 'pending',
          },
        })
        resetDraft(slot)
        showSuccess(t('bonusBuy.slotUpdated'))
      } catch (error) {
        showError(
          error instanceof Error
            ? error.message
            : t('bonusBuy.couldNotUpdateSlot'),
        )
      }
    },
    [getDraft, patchSlotMutation, resetDraft, showError, showSuccess, t],
  )

  const value = useMemo(
    () => ({
      currencyCode: props.currencyCode,
      savingSlotId,
      getDraft,
      updateDraft,
      resetDraft,
      isSlotDirty,
      saveSlot,
    }),
    [
      props.currencyCode,
      savingSlotId,
      getDraft,
      updateDraft,
      resetDraft,
      isSlotDirty,
      saveSlot,
    ],
  )

  return (
    <BonusBuySlotInlineEditContext.Provider value={value}>
      {props.children}
    </BonusBuySlotInlineEditContext.Provider>
  )
}

type SlotCellProps = {
  slot: BonusBuySlot
}

function useSlotFieldDisabled(slot: BonusBuySlot) {
  const { savingSlotId } = useBonusBuySlotInlineEdit()
  return savingSlotId === slot.id
}

function useSlotFieldKeyHandlers(slot: BonusBuySlot) {
  const { resetDraft, saveSlot } = useBonusBuySlotInlineEdit()

  return {
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        void saveSlot(slot)
      }
      if (event.key === 'Escape') {
        resetDraft(slot)
        event.currentTarget.blur()
      }
    },
  }
}

export function BonusBuySlotPurchaseCell({ slot }: SlotCellProps) {
  const { t } = useTranslation()
  const { currencyCode, getDraft, updateDraft } = useBonusBuySlotInlineEdit()
  const disabled = useSlotFieldDisabled(slot)
  const keyHandlers = useSlotFieldKeyHandlers(slot)
  const value = getDraft(slot).purchaseAmount

  return (
    <MoneyInlineField
      value={value}
      onChange={(event) =>
        updateDraft(slot, {
          purchaseAmount: sanitizeDecimalInput(event.target.value),
        })
      }
      onKeyDown={keyHandlers.onKeyDown}
      size="small"
      disabled={disabled}
      slotProps={buildBonusBuyMoneyInputSlotProps(currencyCode)}
      aria-label={t('common.purchase')}
    />
  )
}

export function BonusBuySlotWinCell({ slot }: SlotCellProps) {
  const { t } = useTranslation()
  const { currencyCode, getDraft, updateDraft } = useBonusBuySlotInlineEdit()
  const disabled = useSlotFieldDisabled(slot)
  const keyHandlers = useSlotFieldKeyHandlers(slot)
  const value = getDraft(slot).winAmount

  return (
    <MoneyInlineField
      value={value}
      onChange={(event) =>
        updateDraft(slot, {
          winAmount: sanitizeDecimalInput(event.target.value),
        })
      }
      onKeyDown={keyHandlers.onKeyDown}
      size="small"
      disabled={disabled}
      slotProps={buildBonusBuyMoneyInputSlotProps(currencyCode)}
      aria-label={t('common.win')}
    />
  )
}

export function BonusBuySlotSaveButton({ slot }: SlotCellProps) {
  const { t } = useTranslation()
  const { savingSlotId, isSlotDirty, saveSlot } = useBonusBuySlotInlineEdit()

  const pending = savingSlotId === slot.id
  const dirty = isSlotDirty(slot)
  const active = dirty && !pending

  return (
    <IconButton
      type="button"
      size="small"
      disabled={!dirty || pending}
      aria-label={t('table.saveSlotAria', { name: slot.name })}
      onClick={() => void saveSlot(slot)}
      sx={{
        width: 28,
        height: 28,
        ...(active
          ? {
              color: 'warning.main',
              '&:hover': { bgcolor: 'action.hover', color: 'warning.dark' },
            }
          : undefined),
      }}
    >
      {pending ? (
        <CircularProgress size={20} aria-hidden />
      ) : (
        <SaveIcon sx={{ fontSize: 18 }} aria-hidden />
      )}
    </IconButton>
  )
}
