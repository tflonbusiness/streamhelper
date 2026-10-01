import { IconButton, Stack } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { styled } from '@mui/material/styles'
import type { TFunction } from 'i18next'
import type { PrizeSpinSector } from '@/api/prize-spin'
import type { AppTableColumn } from '@/components/AppTable'
import {
  PrizeSpinSectorColorCell,
  PrizeSpinSectorLabelCell,
  PrizeSpinSectorSaveButton,
  PrizeSpinSectorWinPercentCell,
} from '@/components/prize-spin/session/PrizeSpinSectorInlineEdit'

const colorColumnSx = { pl: 1.5, pr: 0.5, verticalAlign: 'middle' } as const
const labelColumnSx = { verticalAlign: 'middle' } as const
const winPercentColumnSx = { whiteSpace: 'nowrap', verticalAlign: 'middle' } as const

const ActionsStack = styled(Stack)({
  alignItems: 'center',
  justifyContent: 'flex-end',
})

const DeleteButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.error.main,
}))

type BuildPrizeSpinSectorColumnsOptions = {
  readOnly: boolean
  deleteDisabled?: boolean
  onDelete: (sectorId: number) => void
}

export function buildPrizeSpinSectorColumns(
  t: TFunction,
  {
    readOnly,
    deleteDisabled,
    onDelete,
  }: BuildPrizeSpinSectorColumnsOptions,
): AppTableColumn<PrizeSpinSector>[] {
  return [
    {
      id: 'color',
      header: t('common.color'),
      width: 48,
      minWidth: 48,
      sx: colorColumnSx,
      render: (sector) => <PrizeSpinSectorColorCell sector={sector} />,
    },
    {
      id: 'label',
      header: t('common.label'),
      width: '100%',
      sx: labelColumnSx,
      render: (sector) => <PrizeSpinSectorLabelCell sector={sector} />,
    },
    {
      id: 'winPercent',
      header: t('common.winPercent'),
      width: 140,
      minWidth: 140,
      sx: winPercentColumnSx,
      render: (sector) => <PrizeSpinSectorWinPercentCell sector={sector} />,
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      width: 88,
      minWidth: 88,
      render: (sector) => (
        <ActionsStack direction="row" spacing={0.5}>
          <PrizeSpinSectorSaveButton sector={sector} />
          <DeleteButton
            type="button"
            size="small"
            aria-label={t('table.deleteSectorAria', { label: sector.label })}
            disabled={deleteDisabled ?? readOnly}
            onClick={() => void onDelete(sector.id)}
          >
            <DeleteIcon fontSize="small" aria-hidden />
          </DeleteButton>
        </ActionsStack>
      ),
    },
  ]
}
