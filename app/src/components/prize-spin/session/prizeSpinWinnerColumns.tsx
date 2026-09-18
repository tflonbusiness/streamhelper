import { IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { styled } from '@mui/material/styles'
import type { PrizeSpinWin } from '@/api/prize-spin'
import type { AppTableColumn } from '@/components/AppTable'
import { PrizeSpinSessionTruncatedText } from '@/components/prize-spin/session/PrizeSpinSessionTruncatedText'

const truncatedColumnSx = {
  minWidth: 0,
  maxWidth: 0,
  overflow: 'hidden',
} as const

const nickColumnSx = {
  ...truncatedColumnSx,
  fontWeight: 500,
} as const

const DeleteButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.error.main,
}))

type BuildPrizeSpinWinnerColumnsOptions = {
  readOnly: boolean
  onDelete: (winId: number) => void
}

export function buildPrizeSpinWinnerColumns({
  readOnly,
  onDelete,
}: BuildPrizeSpinWinnerColumnsOptions): AppTableColumn<PrizeSpinWin>[] {
  return [
    {
      id: 'nick',
      header: 'Nick',
      width: '50%',
      sx: nickColumnSx,
      render: (win) => (
        <PrizeSpinSessionTruncatedText text={win.participantNick} />
      ),
    },
    {
      id: 'prize',
      header: 'Prize',
      width: '50%',
      sx: truncatedColumnSx,
      render: (win) => (
        <PrizeSpinSessionTruncatedText text={win.sectorLabel} />
      ),
    },
    {
      id: 'action',
      header: '',
      align: 'right',
      width: 56,
      minWidth: 56,
      render: (win) => (
        <DeleteButton
          type="button"
          size="small"
          aria-label={`Remove ${win.participantNick}`}
          disabled={readOnly}
          onClick={() => void onDelete(win.id)}
        >
          <DeleteIcon fontSize="small" aria-hidden />
        </DeleteButton>
      ),
    },
  ]
}
