import DownloadIcon from '@mui/icons-material/Download'
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
}

export const BonusBuySessionSlotsSection = (
  props: BonusBuySessionSlotsSectionProps,
) => {
  const theme = useTheme()
  const { showSuccess, showError } = useNotification()
  const patchSlotMutation = usePatchBonusBuySlot(props.accountId, props.bonusBuyId)

  const [isExportingSlots, setIsExportingSlots] = useState(false)
  const [editSlot, setEditSlot] = useState<BonusBuySlot | null>(null)
  const [deleteSlot, setDeleteSlot] = useState<BonusBuySlot | null>(null)
  const [expandedSlotIds, setExpandedSlotIds] = useState<Set<number>>(new Set())

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
      showSuccess('Slot name copied.')
    } catch {
      showError('Could not copy slot name.')
    }
  }

  function handleDownloadSlots() {
    if (props.slots.length === 0 || isExportingSlots) {
      return
    }

    setIsExportingSlots(true)

    try {
      downloadBonusBuySlotsXlsx(props.slots, props.bonusBuyId)
      showSuccess('Bonus list exported.')
    } catch (exportError) {
      showError(
        exportError instanceof Error
          ? exportError.message
          : 'Could not export bonus list',
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
      showSuccess(playing ? 'Slot set as now playing.' : 'Now playing cleared.')
    } catch (playingError) {
      showError(
        playingError instanceof Error
          ? playingError.message
          : 'Could not update playing state',
      )
    }
  }

  const slotColumns = useMemo(
    () =>
      buildBonusBuySlotColumns({
        theme,
        currencyCode: props.currencyCode,
        onCopySlotName: (slot) => {
          void handleCopySlotName(slot)
        },
        onSetPlaying: (slot, playing) => {
          void handleSetPlaying(slot, playing)
        },
        onEditSlot: setEditSlot,
        onDeleteSlot: setDeleteSlot,
      }),
    [theme, props.currencyCode],
  )

  return (
    <>
      <StyledSessionCard elevation={0}>
        <StyledSessionCardContent>
          <SectionHeader
            title={`Bonus list (${props.slots.length})`}
            description="Track purchases, wins, and which slot is live on the overlay"
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
                  {isExportingSlots ? 'Downloading…' : 'Download XLSX'}
                </Button>
              ) : null
            }
          />
          <AppTable
            columns={slotColumns}
            rows={props.slots}
            getRowKey={(slot) => slot.id}
            emptyMessage="No bonuses added yet."
            getRowSx={(slot) =>
              isBonusBuySlotPlaying(slot) ? playingSlotRowSx(theme) : undefined
            }
            expandable={{
              isExpanded: (slot) => expandedSlotIds.has(slot.id),
              onToggle: (slot) => toggleSlotExpanded(slot.id),
              ariaLabel: (slot) =>
                expandedSlotIds.has(slot.id)
                  ? `Collapse details for ${slot.name}`
                  : `Expand details for ${slot.name}`,
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
