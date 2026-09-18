import { Card, CardContent, Divider } from '@mui/material'
import { styled } from '@mui/material/styles'

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

export const StyledSectionDivider = styled(Divider)(({ theme }) => ({
  marginLeft: theme.spacing(-3),
  marginRight: theme.spacing(-3),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}))

export const StyledFormField = styled('div')(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}))
