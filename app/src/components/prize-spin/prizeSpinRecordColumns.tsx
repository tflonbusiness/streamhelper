import { Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { SquareRounded as SquareRoundedIcon } from '@mui/icons-material'
import { alpha, type Theme } from '@mui/material/styles'
import { Archive, ArrowRight, Radio } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  isPrizeSpinArchived,
  isPrizeSpinLive,
  type PrizeSpinRecord,
} from '@/api/prize-spin'
import type { AppTableColumn } from '@/components/AppTable'
import { LiveStatusChip } from '@/components/LiveStatusChip'
import { mutedChipSx } from '@/theme/colors'

function recordStatusChip(record: PrizeSpinRecord, theme: Theme) {
  if (isPrizeSpinArchived(record)) {
    return <Chip label="Archived" size="small" sx={mutedChipSx(theme)} />
  }

  if (isPrizeSpinLive(record)) {
    return <LiveStatusChip />
  }

  return <Chip label="Off Air" size="small" sx={mutedChipSx(theme)} />
}

type BuildPrizeSpinRecordColumnsOptions = {
  theme: Theme
  liveActionRecordId: number | null
  onGoLive: (record: PrizeSpinRecord) => void
  onDeactivate: (record: PrizeSpinRecord) => void
  onArchive: (record: PrizeSpinRecord) => void
}

export function buildPrizeSpinRecordColumns({
  theme,
  liveActionRecordId,
  onGoLive,
  onDeactivate,
  onArchive,
}: BuildPrizeSpinRecordColumnsOptions): AppTableColumn<PrizeSpinRecord>[] {
  return [
    {
      id: 'title',
      header: 'Title',
      width: '100%',
      sx: {
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      render: (record) => (
        <Typography
          component="span"
          variant="body2"
          sx={{
            fontWeight: 500,
            color: isPrizeSpinArchived(record)
              ? 'text.secondary'
              : 'text.primary',
          }}
        >
          {record.title}
        </Typography>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      width: 108,
      minWidth: 108,
      sx: { px: 1.5, whiteSpace: 'nowrap' },
      render: (record) => recordStatusChip(record, theme),
    },
    {
      id: 'action',
      header: '',
      align: 'right',
      width: 128,
      minWidth: 128,
      sx: { px: 1, whiteSpace: 'nowrap' },
      render: (record) => {
        const isUpdating = liveActionRecordId === record.id
        const readOnly = isPrizeSpinArchived(record)

        return (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ justifyContent: 'flex-end' }}
          >
            {!readOnly && isPrizeSpinLive(record) ? (
              <Tooltip title="Off Air">
                <span>
                  <IconButton
                    type="button"
                    aria-label={`Take ${record.title} off Air`}
                    size="small"
                    disabled={isUpdating}
                    onClick={() => void onDeactivate(record)}
                    sx={{
                      borderRadius: 1,
                      width: 28,
                      height: 28,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.error.main, 0.4),
                      color: theme.palette.error.main,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        borderColor: theme.palette.error.main,
                      },
                    }}
                  >
                    <SquareRoundedIcon sx={{ fontSize: 14 }} aria-hidden />
                  </IconButton>
                </span>
              </Tooltip>
            ) : null}
            {!readOnly && !isPrizeSpinLive(record) ? (
              <Tooltip title="Go live">
                <span>
                  <IconButton
                    type="button"
                    aria-label={`Go live with ${record.title}`}
                    size="small"
                    disabled={isUpdating}
                    onClick={() => void onGoLive(record)}
                    sx={{
                      borderRadius: 1,
                      width: 28,
                      height: 28,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.success.main, 0.4),
                      color: theme.palette.success.light,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        borderColor: theme.palette.success.main,
                      },
                    }}
                  >
                    <Radio size={14} aria-hidden />
                  </IconButton>
                </span>
              </Tooltip>
            ) : null}
            <Tooltip title="Archive">
              <span>
                <IconButton
                  type="button"
                  aria-label={`Archive ${record.title}`}
                  size="small"
                  disabled={readOnly || isUpdating}
                  onClick={() => onArchive(record)}
                  sx={{
                    borderRadius: 1,
                    width: 28,
                    height: 28,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.warning.main, 0.4),
                    color: theme.palette.warning.main,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      borderColor: theme.palette.warning.main,
                    },
                  }}
                >
                  <Archive size={14} aria-hidden />
                </IconButton>
              </span>
            </Tooltip>
            <IconButton
              component={Link}
              to={`/prize-spin/${record.id}`}
              aria-label={`Open ${record.title}`}
              size="small"
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: 1,
                width: 28,
                height: 28,
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              <ArrowRight size={14} aria-hidden />
            </IconButton>
          </Stack>
        )
      },
    },
  ]
}
