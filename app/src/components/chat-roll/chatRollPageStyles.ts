import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { alpha, styled } from '@mui/material/styles'

export const PageStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(4),
}))

export const RollActionBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
}))

export const RollButton = styled(Button)(({ theme }) => ({
  minWidth: 160,
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
}))

export const ListCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.spacing(1),
  boxShadow: 'none',
  height: '100%',
}))

export const ListCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}))

export const ListHeaderStack = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}))

export const ListTitle = styled(Typography)({
  fontWeight: 600,
})

export const EmptyListText = styled(Typography)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}))

export const ListRowsStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1),
}))

export const ListRowStack = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
  paddingLeft: theme.spacing(1.5),
  paddingRight: theme.spacing(1.5),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  border: '1px solid',
  borderColor: theme.palette.divider,
}))

export const ListRowName = styled(Typography)({
  fontFamily: 'monospace',
  flex: 1,
  minWidth: 0,
})

export const ParticipantExtraStack = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  flexShrink: 0,
}))

export const RoleTagChip = styled(Chip)(({ theme }) => ({
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 500,
  backgroundColor: alpha(theme.palette.text.primary, 0.06),
  color: theme.palette.text.secondary,
  border: '1px solid',
  borderColor: alpha(theme.palette.text.primary, 0.1),
}))

export const CoefficientChip = styled(Chip)(({ theme }) => ({
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 500,
  backgroundColor: alpha(theme.palette.info.light, 0.12),
  color: theme.palette.info.light,
  border: '1px solid',
  borderColor: alpha(theme.palette.info.light, 0.24),
}))

export const SettingsCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.spacing(1),
  boxShadow: 'none',
  height: '100%',
}))

export const SettingsCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}))

export const SettingsTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1.5),
}))

export const SettingsStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1.5),
}))

export const SettingsLeftPanel = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
  height: '100%',
}))

export const SettingsGroupPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.25),
  border: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: alpha(theme.palette.background.default, 0.55),
}))

export const SettingsGroupTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  color: theme.palette.text.secondary,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontSize: '0.6875rem',
  marginBottom: theme.spacing(1.25),
  '& .MuiSvgIcon-root': {
    fontSize: '1rem',
    opacity: 0.85,
  },
}))

export const SettingsToggleCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  padding: theme.spacing(1.25, 1.5),
  borderRadius: theme.shape.borderRadius,
  border: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: theme.palette.background.paper,
}))

export const SettingsToggleCopy = styled(Box)({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
})

export const SettingsSectionLabel = styled(Typography)(({ theme }) => ({
  display: 'block',
  color: theme.palette.text.secondary,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  marginBottom: theme.spacing(0.75),
  fontSize: '0.6875rem',
}))

export const CombineFormLabel = styled(FormLabel)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.6875rem',
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  marginBottom: theme.spacing(0.5),
}))

export const CombineRadioGroup = styled(RadioGroup)(({ theme }) => ({
  marginLeft: theme.spacing(-0.5),
}))

export const CombineOption = styled(FormControlLabel)(({ theme }) => ({
  marginRight: theme.spacing(2),
}))

export const ExclusionToggleRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  marginTop: theme.spacing(0.5),
}))

export const ExclusionToggleLabel = styled(Typography)({
  fontWeight: 500,
})

export const RolesSection = styled(Box)({})

export const RoleRowStack = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'enabled',
})<{ enabled?: boolean }>(({ theme, enabled = true }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  border: '1px solid',
  borderColor: theme.palette.divider,
  opacity: enabled ? 1 : 0.55,
}))

export const RoleLabel = styled(Typography)({
  flex: 1,
  minWidth: 0,
  fontWeight: 500,
})

export const KeywordField = styled(TextField)(({ theme }) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
  '& .MuiFormHelperText-root': {
    minHeight: 20,
    margin: 0,
    marginTop: theme.spacing(0.5),
  },
}))

export const RoleWeightField = styled(TextField)(({ theme }) => ({
  width: 72,
  flexShrink: 0,
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
    fontSize: '0.8125rem',
  },
}))
