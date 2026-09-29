import DownloadIcon from '@mui/icons-material/Download'
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import { useMemo, useState } from 'react'
import type { BonusBuySlot } from '@/api/bonus-buy'
import { isBonusBuySlotPlaying } from '@/api/bonus-buy'
import { AppTable } from '@/components/AppTable'
import { SectionHeader, sectionTableIcon } from '@/components/SectionHeader'
import { BonusBuyDeleteSlotDialog } from '@/components/bonus-buy/session/BonusBuyDeleteSlotDialog'
import { BonusBuyEditSlotDialog } from '@/components/bonus-buy/session/BonusBuyEditSlotDialog'
import { BonusBuySlotExpandedDetails } from '@/components/bonus-buy/session/BonusBuySlotExpandedDetails'
import { buildBonusBuySlotColumns } from '@/components/bonus-buy/session/bonusBuySlotColumns'
import {
  buildBonusBuySlotNumberMap,
  DEFAULT_BONUS_BUY_SLOT_SORT,
  sortBonusBuySlots,
  type BonusBuySlotSortField,
  type BonusBuySlotSortState,
} from '@/components/bonus-buy/session/bonusBuySlotSort'
import { playingSlotRowSx } from '@/components/bonus-buy/session/bonusBuySessionStyles'
import {
  StyledSessionCard,
  StyledSessionCardContent,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { useNotification } from '@/context/NotificationContext'
import { downloadBonusBuySlotsXlsx } from '@/lib/bonus-buy-slots-export'
import { usePatchBonusBuySlot } from '@/queries/use-bonus-buy'

type BonusBuySessionSlotsSectionProps = {
  accountId: number
  bonusBuyId: number
  currencyCode: string
  slots: BonusBuySlot[]
  widgetPositiveColor?: string | null
  widgetNegativeColor?: string | null
}

export const BonusBuySessionSlotsSection = (
  props: BonusBuySessionSlotsSectionProps,
) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { showSuccess, showError } = useNotification()
  const patchSlotMutation = usePatchBonusBuySlot(props.accountId, props.bonusBuyId)

  const [isExportingSlots, setIsExportingSlots] = useState(false)
  const [editSlot, setEditSlot] = useState<BonusBuySlot | null>(null)
  const [deleteSlot, setDeleteSlot] = useState<BonusBuySlot | null>(null)
  const [expandedSlotIds, setExpandedSlotIds] = useState<Set<number>>(new Set())
  const [slotSort, setSlotSort] = useState<BonusBuySlotSortState>(
    DEFAULT_BONUS_BUY_SLOT_SORT,
  )

  function handleSlotNameHeaderSort() {
    setSlotSort((previous) => {
      if (previous.field === 'createdAt') {
        return { field: 'slotName', direction: 'asc' }
      }

      if (previous.field === 'slotName') {
        return {
          field: 'slotName',
          direction: previous.direction === 'asc' ? 'desc' : 'asc',
        }
      }

      return DEFAULT_BONUS_BUY_SLOT_SORT
    })
  }

  function handleSortField(field: BonusBuySlotSortField) {
    setSlotSort((previous) => {
      if (previous?.field === field) {
        return {
          field,
          direction: previous.direction === 'asc' ? 'desc' : 'asc',
        }
      }

      return { field, direction: 'asc' }
    })
  }

  const slotNumberById = useMemo(
    () => buildBonusBuySlotNumberMap(props.slots),
    [props.slots],
  )

  const sortedSlots = useMemo(
    () => sortBonusBuySlots(props.slots, slotSort),
    [props.slots, slotSort],
  )

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
      await navigator.clipboard.writeText(slot.name)
      showSuccess(t('bonusBuy.slotNameCopied'))
    } catch {
      showError(t('bonusBuy.couldNotCopySlotName'))
    }
  }

  function handleDownloadSlots() {
    if (props.slots.length === 0 || isExportingSlots) {
      return
    }

    setIsExportingSlots(true)

    try {
      downloadBonusBuySlotsXlsx(props.slots, props.bonusBuyId)
      showSuccess(t('bonusBuy.bonusListExported'))
    } catch (exportError) {
      showError(
        exportError instanceof Error
          ? exportError.message
          : t('bonusBuy.couldNotExportBonusList'),
      )
    } finally {
      setIsExportingSlots(false)
    }
  }

  async function handleSetPlaying(slot: BonusBuySlot, playing: boolean) {
    try {
      await patchSlotMutation.mutateAsync({
        slotId: slot.id,
        body: { status: playing ? 'playing' : 'pending' },
      })
      showSuccess(
        playing ? t('bonusBuy.nowPlayingSet') : t('bonusBuy.nowPlayingCleared'),
      )
    } catch (playingError) {
      showError(
        playingError instanceof Error
          ? playingError.message
          : t('bonusBuy.couldNotUpdatePlaying'),
      )
    }
  }

  const slotColumns = useMemo(
    () =>
      buildBonusBuySlotColumns(t, {
        theme,
        currencyCode: props.currencyCode,
        widgetPositiveColor: props.widgetPositiveColor,
        widgetNegativeColor: props.widgetNegativeColor,
        sort: slotSort,
        onSortField: handleSortField,
        onSortSlotNameHeader: handleSlotNameHeaderSort,
        onCopySlotName: (slot) => {
          void handleCopySlotName(slot)
        },
        onSetPlaying: (slot, playing) => {
          void handleSetPlaying(slot, playing)
        },
        onEditSlot: setEditSlot,
        onDeleteSlot: setDeleteSlot,
        getSlotNumber: (slot) => slotNumberById.get(slot.id) ?? 0,
      }),
    [
      t,
      theme,
      props.currencyCode,
      props.widgetPositiveColor,
      props.widgetNegativeColor,
      slotSort,
      slotNumberById,
    ],
  )

  return (
    <>
      <StyledSessionCard elevation={0}>
        <StyledSessionCardContent>
          <SectionHeader
            title={t('bonusBuy.bonusListCount', { count: props.slots.length })}
            description={t('bonusBuy.slotsDescription')}
            icon={sectionTableIcon}
            iconVariant="secondary"
            action={
              props.slots.length > 0 ? (
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon fontSize="small" aria-hidden />}
                  disabled={isExportingSlots}
                  onClick={handleDownloadSlots}
                >
                  {isExportingSlots ? t('common.downloading') : t('common.downloadXlsx')}
                </Button>
              ) : null
            }
          />
          <AppTable
            columns={slotColumns}
            rows={sortedSlots}
            getRowKey={(slot) => slot.id}
            emptyMessage={t('bonusBuy.noBonusesYet')}
            getRowSx={(slot) =>
              isBonusBuySlotPlaying(slot) ? playingSlotRowSx(theme) : undefined
            }
            expandable={{
              isExpanded: (slot) => expandedSlotIds.has(slot.id),
              onToggle: (slot) => toggleSlotExpanded(slot.id),
              ariaLabel: (slot) =>
                expandedSlotIds.has(slot.id)
                  ? t('common.collapseDetailsAria', { title: slot.name })
                  : t('common.expandDetailsAria', { title: slot.name }),
              renderDetail: (slot) => <BonusBuySlotExpandedDetails slot={slot} />,
            }}
          />
        </StyledSessionCardContent>
      </StyledSessionCard>
      <BonusBuyEditSlotDialog
        accountId={props.accountId}
        bonusBuyId={props.bonusBuyId}
        currencyCode={props.currencyCode}
        slot={editSlot}
        onClose={() => setEditSlot(null)}
      />
      <BonusBuyDeleteSlotDialog
        accountId={props.accountId}
        bonusBuyId={props.bonusBuyId}
        slot={deleteSlot}
        onClose={() => setDeleteSlot(null)}
      />
    </>
  )
}
