import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  FormLabel,
  IconButton,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { alpha, styled } from '@mui/material/styles'
import { appScrollbarStyles } from '@/theme/scrollbar'

export const PageStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(4),
}))

export const RollActionBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'stretch',
  gap: theme.spacing(1),
  width: '100%',
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  border: '1px solid',
  borderColor: alpha(theme.palette.primary.main, 0.28),
  backgroundColor: alpha(theme.palette.primary.main, 0.06),
}))

export const RollButton = styled(Button)(({ theme }) => ({
  flex: '0 0 auto',
  minWidth: 200,
  minHeight: 44,
  fontWeight: 700,
  fontSize: theme.typography.pxToRem(15),
  letterSpacing: '0.02em',
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
  '&.Mui-disabled': {
    boxShadow: 'none',
  },
}))

export const ListCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.spacing(1),
  boxShadow: 'none',
  flex: 1,
  width: '100%',
  minWidth: 0,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
}))

export const ListCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}))

/** Fills a session workspace column so list bodies can scroll inside a fixed height. */
export const WorkspaceListCard = styled(ListCard)({
  flex: 1,
  width: '100%',
  minWidth: 0,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
})

export const WorkspaceListCardContent = styled(ListCardContent)({
  flex: 1,
  minHeight: 0,
})

/** Pinned section title row; stays visible while the body below scrolls. */
export const WorkspaceSectionHeader = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  position: 'sticky',
  top: 0,
  zIndex: 1,
  marginLeft: theme.spacing(-2),
  marginRight: theme.spacing(-2),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingBottom: theme.spacing(1.5),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& > div:first-of-type': {
    marginBottom: 0,
  },
}))

export const WorkspaceSectionScrollBody = styled(Box)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  overflowX: 'hidden',
  overflowY: 'auto',
  ...appScrollbarStyles(theme),
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
  paddingBottom: theme.spacing(2),
}))

export const ListRowsStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1),
  flex: 1,
  minHeight: 0,
  overflowX: 'hidden',
  overflowY: 'auto',
  ...appScrollbarStyles(theme),
  [theme.breakpoints.down('lg')]: {
    maxHeight: 360,
  },
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

export const ListRowPrimaryStack = styled(Stack)({
  flex: 1,
  minWidth: 0,
})

export const ListRowNameTooltipWrap = styled('span')({
  display: 'block',
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
})

export const ListRowName = styled(Typography)({
  fontFamily: 'monospace',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const ListRowMeta = styled(Typography)({
  flexShrink: 0,
  minWidth: 0,
  display: 'inline-flex',
  alignItems: 'center',
  lineHeight: 1.43,
})

export const ListRowMetaTooltipWrap = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  lineHeight: 0,
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
  flex: 1,
  width: '100%',
  minWidth: 0,
  minHeight: 0,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}))

export const SettingsCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
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

export const SettingsGroupTitleButton = styled('button', {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded: boolean }>(({ theme, expanded }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
  width: '100%',
  margin: 0,
  marginBottom: expanded ? theme.spacing(1.25) : 0,
  padding: 0,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  textAlign: 'left',
  color: 'inherit',
  borderRadius: theme.shape.borderRadius,
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}))

export const SettingsGroupTitleMain = styled(SettingsGroupTitle)({
  marginBottom: 0,
  flex: 1,
  minWidth: 0,
})

export const SettingsGroupExpandIcon = styled(ExpandMoreIcon, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded: boolean }>(({ theme, expanded }) => ({
  flexShrink: 0,
  fontSize: '1.25rem',
  color: theme.palette.text.secondary,
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shorter,
  }),
  transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
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

export const SettingsToggleCardColumn = styled(SettingsToggleCard)({
  flexDirection: 'column',
  alignItems: 'stretch',
})

export const SettingsToggleCardRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
}))

export const SettingsToggleCopy = styled(Box)({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
})

/** Dependent control in the same card, below the toggle row. */
export const SettingsToggleNestedField = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  width: '100%',
}))

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

export const SettingsUnsavedAlert = styled(Alert)(({ theme }) => ({
  marginTop: theme.spacing(-1),
  marginBottom: theme.spacing(2),
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  alignItems: 'center',
  fontSize: theme.typography.pxToRem(13),
  lineHeight: 1.45,
  backgroundColor: alpha(theme.palette.warning.main, 0.08),
  borderColor: alpha(theme.palette.warning.main, 0.35),
  '& .MuiAlert-icon': {
    paddingTop: 0,
    paddingBottom: 0,
    marginRight: theme.spacing(1),
    opacity: 0.9,
  },
  '& .MuiAlert-message': {
    paddingTop: theme.spacing(0.25),
    paddingBottom: theme.spacing(0.25),
  },
}))

export const SettingsHeaderActions = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  flexShrink: 0,
}))

export const SETTINGS_PANEL_COLLAPSED_WIDTH = 52

export const SettingsCollapsedCard = styled(SettingsCard)({
  width: SETTINGS_PANEL_COLLAPSED_WIDTH,
  maxWidth: SETTINGS_PANEL_COLLAPSED_WIDTH,
  flex: '1 1 auto',
  alignSelf: 'stretch',
})

export const SettingsCollapsedRail = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  gap: theme.spacing(1.5),
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  height: '100%',
}))

export const SettingsExpandButton = styled(IconButton)(({ theme }) => ({
  width: 32,
  height: 32,
  color: theme.palette.text.secondary,
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
