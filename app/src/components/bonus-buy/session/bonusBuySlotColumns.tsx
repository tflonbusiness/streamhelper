import { Box, Chip, IconButton, Stack } from '@mui/material'
import AdjustIcon from '@mui/icons-material/Adjust'
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { alpha, type Theme } from '@mui/material/styles'
import type { TFunction } from 'i18next'
import type { BonusBuySlot } from '@/api/bonus-buy'
import { isBonusBuySlotPlaying } from '@/api/bonus-buy'
import type { AppTableColumn } from '@/components/AppTable'
import {
  formatMultiplierDisplay,
} from '@/lib/bonus-buy-stats'
import {
  formatBonusBuyMoney,
  signedValueColor,
} from '@/components/bonus-buy/session/bonus-buy-session-utils'
import { slotActionIconButtonSx } from '@/components/bonus-buy/session/bonusBuySessionStyles'
import { toneChipSx } from '@/theme/colors'

type BuildBonusBuySlotColumnsOptions = {
  theme: Theme
  currencyCode: string
  onCopySlotName: (slot: BonusBuySlot) => void
  onSetPlaying: (slot: BonusBuySlot, playing: boolean) => void
  onEditSlot: (slot: BonusBuySlot) => void
  onDeleteSlot: (slot: BonusBuySlot) => void
}

export function buildBonusBuySlotColumns(
  t: TFunction,
  {
    theme,
    currencyCode,
    onCopySlotName,
    onSetPlaying,
    onEditSlot,
    onDeleteSlot,
  }: BuildBonusBuySlotColumnsOptions,
): AppTableColumn<BonusBuySlot>[] {

  return [
    {
      id: 'slotName',
      header: t('table.slotName'),
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
            {slot.name}
          </Box>
          <IconButton
            size="small"
            aria-label={t('table.copySlotAria', { name: slot.name })}
            onClick={(event) => {
              event.stopPropagation()
              onCopySlotName(slot)
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
            <ContentCopyIcon sx={{ fontSize: 12 }} aria-hidden />
          </IconButton>
          {isBonusBuySlotPlaying(slot) ? (
            <Chip
              label={t('common.nowPlaying')}
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
      header: t('common.purchase'),
      width: 110,
      render: (slot) =>
        formatBonusBuyMoney(slot.purchaseAmount, currencyCode),
    },
    {
      id: 'win',
      header: t('common.win'),
      width: 100,
      render: (slot) => {
        if (slot.winAmount == null) {
          return (
            <Box component="span" sx={{ color: 'text.secondary' }}>
              {t('common.pending')}
            </Box>
          )
        }

        const value = Number.parseFloat(slot.winAmount)
        return (
          <Box
            component="span"
            sx={{ color: signedValueColor(value, theme) ?? 'inherit' }}
          >
            {formatBonusBuyMoney(slot.winAmount, currencyCode)}
          </Box>
        )
      },
    },
    {
      id: 'multiplier',
      header: t('table.multiplier'),
      width: 100,
      render: (slot) => {
        if (!slot.multiplier) {
          return (
            <Box component="span" sx={{ color: 'text.secondary' }}>
              {t('common.emDash')}
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
      header: t('common.actions'),
      width: 112,
      minWidth: 112,
      align: 'right',
      sx: { px: 1, whiteSpace: 'nowrap' },
      render: (slot) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <IconButton
            size="small"
            aria-label={
              isBonusBuySlotPlaying(slot)
                ? t('table.clearNowPlayingAria', { name: slot.name })
                : t('table.setNowPlayingAria', { name: slot.name })
            }
            aria-pressed={isBonusBuySlotPlaying(slot)}
            onClick={() => onSetPlaying(slot, !isBonusBuySlotPlaying(slot))}
            sx={slotActionIconButtonSx(
              isBonusBuySlotPlaying(slot) ? 'warning' : 'primary',
              theme,
            )}
          >
            {isBonusBuySlotPlaying(slot) ? (
              <AdjustIcon sx={{ fontSize: 14 }} aria-hidden />
            ) : (
              <CircleOutlinedIcon sx={{ fontSize: 14 }} aria-hidden />
            )}
          </IconButton>
          <IconButton
            size="small"
            aria-label={t('table.editSlotAria', { name: slot.name })}
            onClick={() => onEditSlot(slot)}
            sx={slotActionIconButtonSx('info', theme)}
          >
            <EditIcon sx={{ fontSize: 14 }} aria-hidden />
          </IconButton>
          <IconButton
            size="small"
            aria-label={t('table.deleteSlotAria', { name: slot.name })}
            onClick={() => onDeleteSlot(slot)}
            sx={slotActionIconButtonSx('error', theme)}
          >
            <DeleteIcon sx={{ fontSize: 14 }} aria-hidden />
          </IconButton>
        </Box>
      ),
    },
  ]
}
