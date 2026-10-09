import { Box, Chip, IconButton, Stack } from '@mui/material'
import AdjustIcon from '@mui/icons-material/Adjust'
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import { alpha, type Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import type { TFunction } from 'i18next'
import type { BonusBuySlot } from '@/api/bonus-buy'
import { isBonusBuySlotPlaying } from '@/api/bonus-buy'
import type { AppTableColumn } from '@/components/AppTable'
import { formatMultiplierDisplay } from '@/lib/bonus-buy-stats'
import { getBonusBuySlotResultColors } from '@/components/bonus-buy/widget/bonus-buy-widget-slot-utils'
import {
  BonusBuySlotNameCell,
  BonusBuySlotPurchaseCell,
  BonusBuySlotSaveButton,
  BonusBuySlotWinCell,
} from '@/components/bonus-buy/session/BonusBuySlotInlineEdit'
import { DEFAULT_AVERAGE_X_COLOR_THEME } from '@/lib/bonus-buy-widget-presentation'
import { slotActionIconButtonSx } from '@/components/bonus-buy/session/bonusBuySessionStyles'
import { toneChipSx } from '@/theme/colors'

type BuildBonusBuySlotColumnsOptions = {
  theme: Theme
  widgetPositiveColor?: string | null
  widgetNegativeColor?: string | null
  onCopySlotName: (slot: BonusBuySlot) => void
  onSetPlaying: (slot: BonusBuySlot, playing: boolean) => void
  onDeleteSlot: (slot: BonusBuySlot) => void
}

const COL_INDEX_WIDTH = 40
const COL_MONEY_WIDTH = 152
const COL_MULTIPLIER_WIDTH = 120
const COL_ACTIONS_WIDTH = 112
const SLOT_NAME_FIELD_WIDTH = 280
const SLOT_NAME_COLUMN_MIN_WIDTH = 360

const metricCellSx = {
  verticalAlign: 'middle',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
  px: 1.5,
} as const

function metricCell(content: ReactNode) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>{content}</Box>
  )
}

export function buildBonusBuySlotColumns(
  t: TFunction,
  {
    theme,
    widgetPositiveColor,
    widgetNegativeColor,
    onCopySlotName,
    onSetPlaying,
    onDeleteSlot,
  }: BuildBonusBuySlotColumnsOptions,
): AppTableColumn<BonusBuySlot>[] {
  const slotResultColorTheme = {
    positiveColor:
      widgetPositiveColor?.trim() ||
      DEFAULT_AVERAGE_X_COLOR_THEME.positiveColor,
    negativeColor:
      widgetNegativeColor?.trim() ||
      DEFAULT_AVERAGE_X_COLOR_THEME.negativeColor,
    textMutedColor: theme.palette.text.secondary,
  }

  return [
    {
      id: 'number',
      header: '#',
      width: COL_INDEX_WIDTH,
      minWidth: COL_INDEX_WIDTH,
      align: 'right',
      sx: {
        color: 'text.secondary',
        fontVariantNumeric: 'tabular-nums',
        pl: 1.5,
        pr: 0.5,
        verticalAlign: 'middle',
      },
      render: (slot) => slot.sortOrder,
    },
    {
      id: 'slotName',
      header: t('table.slotName'),
      width: '100%',
      sx: {
        fontWeight: 500,
        minWidth: SLOT_NAME_COLUMN_MIN_WIDTH,
        verticalAlign: 'middle',
        pr: 1,
      },
      render: (slot) => (
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ alignItems: 'center', minWidth: 0, width: '100%' }}
        >
          <Box
            sx={{
              width: SLOT_NAME_FIELD_WIDTH,
              minWidth: SLOT_NAME_FIELD_WIDTH,
              maxWidth: SLOT_NAME_FIELD_WIDTH,
              flexShrink: 0,
            }}
          >
            <BonusBuySlotNameCell slot={slot} />
          </Box>
          <IconButton
            size="small"
            aria-label={t('table.copySlotAria', { name: slot.name })}
            onClick={(event) => {
              event.stopPropagation()
              onCopySlotName(slot)
            }}
            sx={{
              width: 20,
              height: 20,
              flexShrink: 0,
              ml: 0.5,
              p: 0.25,
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
                height: 22,
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
      width: COL_MONEY_WIDTH,
      minWidth: COL_MONEY_WIDTH,
      align: 'right',
      sx: metricCellSx,
      render: (slot) =>
        metricCell(<BonusBuySlotPurchaseCell slot={slot} />),
    },
    {
      id: 'win',
      header: t('common.win'),
      width: COL_MONEY_WIDTH,
      minWidth: COL_MONEY_WIDTH,
      align: 'right',
      sx: metricCellSx,
      render: (slot) => metricCell(<BonusBuySlotWinCell slot={slot} />),
    },
    {
      id: 'multiplier',
      header: t('table.multiplier'),
      width: COL_MULTIPLIER_WIDTH,
      minWidth: COL_MULTIPLIER_WIDTH,
      align: 'right',
      sx: metricCellSx,
      render: (slot) => {
        if (!slot.multiplier) {
          return metricCell(
            <Box component="span" sx={{ color: 'text.secondary' }}>
              {t('common.emDash')}
            </Box>,
          )
        }

        const { multiplierColor } = getBonusBuySlotResultColors(
          slot,
          slotResultColorTheme,
        )

        return metricCell(
          <Box component="span" sx={{ color: multiplierColor }}>
            {formatMultiplierDisplay(slot.multiplier)}
          </Box>,
        )
      },
    },
    {
      id: 'actions',
      header: '',
      width: COL_ACTIONS_WIDTH,
      minWidth: COL_ACTIONS_WIDTH,
      align: 'right',
      sx: { pl: 0.5, pr: 1.5, whiteSpace: 'nowrap', verticalAlign: 'middle' },
      render: (slot) => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <BonusBuySlotSaveButton slot={slot} />
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
