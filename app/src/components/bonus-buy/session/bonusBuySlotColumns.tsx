import { Box, Chip, IconButton, Stack, TableSortLabel } from '@mui/material'
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
  BonusBuySlotPurchaseCell,
  BonusBuySlotSaveButton,
  BonusBuySlotWinCell,
} from '@/components/bonus-buy/session/BonusBuySlotInlineEdit'
import { DEFAULT_AVERAGE_X_COLOR_THEME } from '@/lib/bonus-buy-widget-presentation'
import { slotActionIconButtonSx } from '@/components/bonus-buy/session/bonusBuySessionStyles'
import { toneChipSx } from '@/theme/colors'
import type {
  BonusBuySlotSortField,
  BonusBuySlotSortState,
} from '@/components/bonus-buy/session/bonusBuySlotSort'

type BuildBonusBuySlotColumnsOptions = {
  theme: Theme
  widgetPositiveColor?: string | null
  widgetNegativeColor?: string | null
  sort: BonusBuySlotSortState | null
  onSortField: (field: BonusBuySlotSortField) => void
  onSortSlotNameHeader: () => void
  onCopySlotName: (slot: BonusBuySlot) => void
  onSetPlaying: (slot: BonusBuySlot, playing: boolean) => void
  onDeleteSlot: (slot: BonusBuySlot) => void
  getSlotNumber: (slot: BonusBuySlot) => number
}

const COL_INDEX_WIDTH = 40
const COL_MONEY_WIDTH = 152
const COL_MULTIPLIER_WIDTH = 120
const COL_ACTIONS_WIDTH = 112
const SLOT_NAME_FIELD_MAX_WIDTH = 160
const SLOT_NAME_COLUMN_MIN_WIDTH = 168

const metricCellSx = {
  verticalAlign: 'middle',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
  px: 1.5,
} as const

const sortableHeaderIconSx = (theme: Theme, active: boolean) => ({
  color: 'inherit',
  '& .MuiTableSortLabel-icon': {
    opacity: active ? 1 : 0.45,
    color: theme.palette.text.secondary,
  },
  '&:hover .MuiTableSortLabel-icon': {
    opacity: active ? 1 : 0.7,
  },
})

function sortableHeader(
  label: string,
  field: BonusBuySlotSortField,
  sort: BonusBuySlotSortState | null,
  onSortField: (field: BonusBuySlotSortField) => void,
  theme: Theme,
) {
  const active = sort?.field === field

  return (
    <TableSortLabel
      active={active}
      direction={active ? sort.direction : 'asc'}
      onClick={() => onSortField(field)}
      sx={sortableHeaderIconSx(theme, active)}
    >
      {label}
    </TableSortLabel>
  )
}

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
    sort,
    onSortField,
    onSortSlotNameHeader,
    onCopySlotName,
    onSetPlaying,
    onDeleteSlot,
    getSlotNumber,
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
      render: (slot) => getSlotNumber(slot),
    },
    {
      id: 'slotName',
      header: (() => {
        const active =
          sort?.field === 'createdAt' || sort?.field === 'slotName'

        return (
          <TableSortLabel
            active={active}
            direction={active ? sort.direction : 'asc'}
            onClick={onSortSlotNameHeader}
            sx={sortableHeaderIconSx(theme, active)}
          >
            {t('table.slotName')}
          </TableSortLabel>
        )
      })(),
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
          sx={{
            alignItems: 'center',
            minWidth: 0,
            maxWidth: SLOT_NAME_FIELD_MAX_WIDTH + 120,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              minWidth: 0,
              maxWidth: '100%',
            }}
          >
            <Box
              component="span"
              title={slot.name}
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
          </Box>
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
      header: sortableHeader(
        t('common.purchase'),
        'purchase',
        sort,
        onSortField,
        theme,
      ),
      width: COL_MONEY_WIDTH,
      minWidth: COL_MONEY_WIDTH,
      align: 'right',
      sx: metricCellSx,
      render: (slot) =>
        metricCell(<BonusBuySlotPurchaseCell slot={slot} />),
    },
    {
      id: 'win',
      header: sortableHeader(t('common.win'), 'win', sort, onSortField, theme),
      width: COL_MONEY_WIDTH,
      minWidth: COL_MONEY_WIDTH,
      align: 'right',
      sx: metricCellSx,
      render: (slot) => metricCell(<BonusBuySlotWinCell slot={slot} />),
    },
    {
      id: 'multiplier',
      header: sortableHeader(
        t('table.multiplier'),
        'multiplier',
        sort,
        onSortField,
        theme,
      ),
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
