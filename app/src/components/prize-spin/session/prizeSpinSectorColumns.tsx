import { IconButton, Stack } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { styled } from '@mui/material/styles'
import type { PrizeSpinSector } from '@/api/prize-spin'
import type { AppTableColumn } from '@/components/AppTable'
import { PrizeSpinSessionColorSwatch } from '@/components/prize-spin/session/PrizeSpinSessionColorSwatch'

const colorColumnSx = { px: 1 } as const
const labelColumnSx = { fontWeight: 500 } as const
const winPercentColumnSx = { whiteSpace: 'nowrap' } as const

const ActionsStack = styled(Stack)({
  justifyContent: 'flex-end',
})

const DeleteButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.error.main,
}))

type BuildPrizeSpinSectorColumnsOptions = {
  readOnly: boolean
  onEdit: (sector: PrizeSpinSector) => void
  onDelete: (sectorId: number) => void
}

export function buildPrizeSpinSectorColumns({
  readOnly,
  onEdit,
  onDelete,
}: BuildPrizeSpinSectorColumnsOptions): AppTableColumn<PrizeSpinSector>[] {
  return [
    {
      id: 'color',
      header: '',
      width: 40,
      minWidth: 40,
      sx: colorColumnSx,
      render: (sector) => (
        <PrizeSpinSessionColorSwatch swatchColor={sector.color} />
      ),
    },
    {
      id: 'label',
      header: 'Label',
      width: '100%',
      sx: labelColumnSx,
      render: (sector) => sector.label,
    },
    {
      id: 'winPercent',
      header: 'Win %',
      width: 88,
      minWidth: 88,
      sx: winPercentColumnSx,
      render: (sector) => `${sector.winPercent}%`,
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      width: 88,
      minWidth: 88,
      render: (sector) => (
        <ActionsStack direction="row" spacing={0.5}>
          <IconButton
            type="button"
            size="small"
            aria-label={`Edit ${sector.label}`}
            disabled={readOnly}
            onClick={() => onEdit(sector)}
          >
            <EditIcon fontSize="small" aria-hidden />
          </IconButton>
          <DeleteButton
            type="button"
            size="small"
            aria-label={`Delete ${sector.label}`}
            disabled={readOnly}
            onClick={() => void onDelete(sector.id)}
          >
            <DeleteIcon fontSize="small" aria-hidden />
          </DeleteButton>
        </ActionsStack>
      ),
    },
  ]
}
