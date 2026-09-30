import { Card, CardContent, Stack, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { SectionDivider } from '@/components/SectionHeader'

export const StyledSessionCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.spacing(1),
  boxShadow: 'none',
}))

export const StyledSessionCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
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
