import { Button, Chip, Stack, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import LinkIcon from '@mui/icons-material/Link'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PaletteIcon from '@mui/icons-material/Palette'
import StopCircleIcon from '@mui/icons-material/StopCircle'
import { alpha, styled } from '@mui/material/styles'
import { Link } from 'react-router-dom'
import type { BonusBuyRecord } from '@/api/bonus-buy'
import { isBonusBuyActive } from '@/api/bonus-buy'
import {
  StyledCompactSessionCardContent,
  StyledSessionCard,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { StatusAlert } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'

type BonusBuySessionHeaderSectionProps = {
  bonusBuyId: number
  record: BonusBuyRecord
  onOpenEndDialog: () => void
  onOpenEditDialog: () => void
  onOpenWidgetDialog: () => void
}

const HeaderStack = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  justifyContent: 'space-between',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('lg')]: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}))

const TitleStack = styled(Stack)({
  minWidth: 0,
  alignItems: 'center',
})

const SessionTitle = styled(Typography)({
  fontWeight: 600,
})

const SessionId = styled('span')(({ theme }) => ({
  ...theme.typography.h6,
  fontWeight: 600,
  color: theme.palette.text.secondary,
}))

const ActionsStack = styled(Stack)(({ theme }) => ({
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}))

const EndSessionButton = styled(Button)(({ theme }) => ({
  borderColor: alpha(theme.palette.error.main, 0.4),
  color: theme.palette.error.main,
  '&:hover': {
    borderColor: theme.palette.error.main,
    backgroundColor: alpha(theme.palette.error.main, 0.1),
  },
}))

const EndedChip = styled(Chip)({
  flexShrink: 0,
  color: 'text.secondary',
  borderColor: 'divider',
})

const EndedAlert = styled(StatusAlert)(({ theme }) => ({
  marginTop: theme.spacing(2),
}))

export const BonusBuySessionHeaderSection = (
  props: BonusBuySessionHeaderSectionProps,
) => {
  const { showSuccess } = useNotification()
  const active = isBonusBuyActive(props.record)

  return (
    <>
      <StyledSessionCard elevation={0}>
        <StyledCompactSessionCardContent>
          <HeaderStack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
            <TitleStack direction="row" spacing={1}>
              <SessionTitle variant="h6" noWrap>
                {props.record.name}{' '}
                <SessionId>#{props.record.id}</SessionId>
              </SessionTitle>
              {!active ? (
                <EndedChip label="Ended" size="small" variant="outlined" />
              ) : null}
            </TitleStack>
            <ActionsStack direction="row">
              {active ? (
                <EndSessionButton
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<StopCircleIcon fontSize="small" aria-hidden />}
                  onClick={props.onOpenEndDialog}
                >
                  End Bonus Buy
                </EndSessionButton>
              ) : null}
              {active ? (
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon fontSize="small" aria-hidden />}
                  onClick={props.onOpenEditDialog}
                >
                  Edit
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<PaletteIcon fontSize="small" aria-hidden />}
                onClick={props.onOpenWidgetDialog}
              >
                Widget Style
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<LinkIcon fontSize="small" aria-hidden />}
                onClick={() => showSuccess('Coming soon')}
              >
                OBS Link
              </Button>
              <Button
                component={Link}
                to={`/bonus-buy/${props.bonusBuyId}/widget`}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="small"
                startIcon={<OpenInNewIcon fontSize="small" aria-hidden />}
              >
                Overlay
              </Button>
            </ActionsStack>
          </HeaderStack>
          {!active ? (
            <EndedAlert tone="warning">
              This bonus buy session has ended.
            </EndedAlert>
          ) : null}
        </StyledCompactSessionCardContent>
      </StyledSessionCard>
    </>
  )
}
