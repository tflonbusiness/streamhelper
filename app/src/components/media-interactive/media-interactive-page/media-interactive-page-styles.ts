import { Card, CardContent, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'

export const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.spacing(1),
  boxShadow: 'none',
}))

export const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
}))

export const StyledContentStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
}))

export const StyledSubsectionStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1.5),
}))

export const StyledSubsectionLabel = styled('span')(({ theme }) => ({
  fontSize: '0.6875rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
}))

export const StyledSettingsSection = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
}))

export const StyledSettingsSectionsRoot = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
  paddingTop: theme.spacing(1),
}))
