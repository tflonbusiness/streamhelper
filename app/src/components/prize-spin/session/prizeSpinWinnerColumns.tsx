import { IconButton, Stack } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import { alpha, styled, type Theme } from '@mui/material/styles'
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

function copyNickButtonSx(theme: Theme) {
  return {
    width: 28,
    height: 28,
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.dark,
      bgcolor: alpha(theme.palette.primary.main, 0.12),
    },
  }
}

type BuildPrizeSpinWinnerColumnsOptions = {
  theme: Theme
  readOnly: boolean
  onCopyNick: (win: PrizeSpinWin) => void
  onDelete: (winId: number) => void
}

export function buildPrizeSpinWinnerColumns({
  theme,
  readOnly,
  onCopyNick,
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
      width: 80,
      minWidth: 80,
      render: (win) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          <IconButton
            type="button"
            size="small"
            aria-label={`Copy ${win.participantNick}`}
            onClick={(event) => {
              event.stopPropagation()
              onCopyNick(win)
            }}
            sx={copyNickButtonSx(theme)}
          >
            <ContentCopyIcon sx={{ fontSize: 14 }} aria-hidden />
          </IconButton>
          <DeleteButton
            type="button"
            size="small"
            aria-label={`Remove ${win.participantNick}`}
            disabled={readOnly}
            onClick={(event) => {
              event.stopPropagation()
              onDelete(win.id)
            }}
          >
            <DeleteIcon fontSize="small" aria-hidden />
          </DeleteButton>
        </Stack>
      ),
    },
  ]
}
