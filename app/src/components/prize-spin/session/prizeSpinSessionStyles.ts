import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { SectionDivider } from '@/components/SectionHeader'
import { appScrollbarStyles } from '@/theme/scrollbar'

/** Fallback height for sectors on stacked (mobile) layout. */
export const PRIZE_SPIN_SESSION_SECTORS_SCROLL_HEIGHT_PX = 400
export const PRIZE_SPIN_SESSION_WINNERS_SCROLL_HEIGHT_PX = 480

export const StyledSessionCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.spacing(1),
  boxShadow: 'none',
}))

/** Spin / stats blocks: natural content height, not flex-grown or compressed. */
export const StyledSessionIntrinsicHeightCard = styled(StyledSessionCard)({
  flex: '0 0 auto',
  flexShrink: 0,
  width: '100%',
})

export const StyledSessionCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
}))

export const StyledSessionScrollableCard = styled(StyledSessionCard)({
  flex: '0 0 auto',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
})

export const StyledSessionScrollableCardContent = styled(StyledSessionCardContent)({
  display: 'flex',
  flexDirection: 'column',
})

export const StyledSessionSectionChrome = styled(Box)({
  flexShrink: 0,
})

/** Sectors: fill column height on lg; fixed height when stacked. */
export const StyledSessionSectorsScrollableCard = styled(StyledSessionCard)(
  ({ theme }) => ({
    flex: '1 1 auto',
    minHeight: 0,
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('lg')]: {
      flex: '0 0 auto',
      height: 'auto',
      minHeight: PRIZE_SPIN_SESSION_SECTORS_SCROLL_HEIGHT_PX,
    },
  }),
)

export const StyledSessionSectorsScrollableCardContent = styled(
  StyledSessionCardContent,
)({
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
})

export const StyledSessionSectorsTableScrollBody = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  overflowX: 'auto',
  overflowY: 'auto',
  ...appScrollbarStyles(theme),
  [theme.breakpoints.down('lg')]: {
    flex: '0 0 auto',
    height: PRIZE_SPIN_SESSION_SECTORS_SCROLL_HEIGHT_PX,
    minHeight: PRIZE_SPIN_SESSION_SECTORS_SCROLL_HEIGHT_PX,
    maxHeight: PRIZE_SPIN_SESSION_SECTORS_SCROLL_HEIGHT_PX,
  },
}))

export const StyledSessionWinnersTableScrollBody = styled(Box)(({ theme }) => ({
  flex: '0 0 auto',
  boxSizing: 'border-box',
  width: '100%',
  height: PRIZE_SPIN_SESSION_WINNERS_SCROLL_HEIGHT_PX,
  minHeight: PRIZE_SPIN_SESSION_WINNERS_SCROLL_HEIGHT_PX,
  maxHeight: PRIZE_SPIN_SESSION_WINNERS_SCROLL_HEIGHT_PX,
  overflowX: 'auto',
  overflowY: 'auto',
  ...appScrollbarStyles(theme),
}))

export const StyledCompactSessionCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}))

/** Session page header: badge group + title row. */
export const StyledSessionHeaderTitleRow = styled(Stack)(({ theme }) => ({
  minWidth: 0,
  alignItems: 'center',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
}))

/** Adjacent status chips after the session title (e.g. Chat Roll live). */
export const StyledSessionBadgeGroup = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  flexShrink: 0,
  gap: theme.spacing(1.5),
}))

export const StyledSessionHeaderTitle = styled(Typography)({
  fontWeight: 600,
  minWidth: 0,
})

export const StyledSectionDivider = SectionDivider

export const StyledFormField = styled('div')(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}))
