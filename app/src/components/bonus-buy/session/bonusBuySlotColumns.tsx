import { Box, Chip, IconButton, Stack, TableSortLabel } from '@mui/material'
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
import { formatBonusBuyMoney } from '@/components/bonus-buy/session/bonus-buy-session-utils'
import { getBonusBuySlotResultColors } from '@/components/bonus-buy/widget/bonus-buy-widget-slot-utils'
import { DEFAULT_AVERAGE_X_COLOR_THEME } from '@/lib/bonus-buy-widget-presentation'
import { slotActionIconButtonSx } from '@/components/bonus-buy/session/bonusBuySessionStyles'
import { toneChipSx } from '@/theme/colors'
import type {
  BonusBuySlotSortField,
  BonusBuySlotSortState,
} from '@/components/bonus-buy/session/bonusBuySlotSort'

type BuildBonusBuySlotColumnsOptions = {
  theme: Theme
  currencyCode: string
  widgetPositiveColor?: string | null
  widgetNegativeColor?: string | null
  sort: BonusBuySlotSortState | null
  onSortField: (field: BonusBuySlotSortField) => void
  onCopySlotName: (slot: BonusBuySlot) => void
  onSetPlaying: (slot: BonusBuySlot, playing: boolean) => void
  onEditSlot: (slot: BonusBuySlot) => void
  onDeleteSlot: (slot: BonusBuySlot) => void
}

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

export function buildBonusBuySlotColumns(
  t: TFunction,
  {
    theme,
    currencyCode,
    widgetPositiveColor,
    widgetNegativeColor,
    sort,
    onSortField,
    onCopySlotName,
    onSetPlaying,
    onEditSlot,
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
      header: sortableHeader(
        t('common.purchase'),
        'purchase',
        sort,
        onSortField,
        theme,
      ),
      width: 110,
      render: (slot) =>
        formatBonusBuyMoney(slot.purchaseAmount, currencyCode),
    },
    {
      id: 'win',
      header: sortableHeader(t('common.win'), 'win', sort, onSortField, theme),
      width: 100,
      render: (slot) => {
        const { winColor } = getBonusBuySlotResultColors(
          slot,
          slotResultColorTheme,
        )

        if (slot.winAmount == null) {
          return (
            <Box component="span" sx={{ color: winColor }}>
              {t('common.pending')}
            </Box>
          )
        }

        return (
          <Box component="span" sx={{ color: winColor }}>
            {formatBonusBuyMoney(slot.winAmount, currencyCode)}
          </Box>
        )
      },
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
      width: 100,
      render: (slot) => {
        if (!slot.multiplier) {
          return (
            <Box component="span" sx={{ color: 'text.secondary' }}>
              {t('common.emDash')}
            </Box>
          )
        }

        const { multiplierColor } = getBonusBuySlotResultColors(
          slot,
          slotResultColorTheme,
        )

        return (
          <Box component="span" sx={{ color: multiplierColor }}>
            {formatMultiplierDisplay(slot.multiplier)}
          </Box>
        )
      },
    },
    {
      id: 'actions',
      header: '',
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
