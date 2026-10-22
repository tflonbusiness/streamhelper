import { Box, Button, Stack, Typography } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'

export const SettingsHeaderBlock = styled(Stack)(({ theme }) => ({
  width: '100%',
  gap: theme.spacing(1.25),
  marginBottom: theme.spacing(0.5),
}))

export const SettingsFormRoot = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2.5),
}))

export const SettingsGroup = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1),
}))

export const SettingsGroupLabel = styled(Typography)(({ theme }) => ({
  display: 'block',
  color: theme.palette.text.secondary,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontSize: '0.6875rem',
}))

export const SettingsGroupPanel = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.25),
  border: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: alpha(theme.palette.background.default, 0.55),
}))

export const SettingsToggleRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
}))

export const SettingsToggleCopy = styled(Box)({
  flex: 1,
  minWidth: 0,
  paddingTop: 2,
})

export const SettingsToggleLabel = styled(Typography)({
  fontWeight: 500,
  lineHeight: 1.4,
})

export const SettingsNestedField = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(4.5),
}))

export const SettingsSaveButton = styled(Button)(({ theme }) => ({
  flexShrink: 0,
  minWidth: 0,
  paddingLeft: theme.spacing(1.5),
  paddingRight: theme.spacing(1.75),
  whiteSpace: 'nowrap',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none',
  },
}))
