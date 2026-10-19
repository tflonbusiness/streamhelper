import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
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

export const StyledViewerOrdersSteps = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1.25),
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.action.hover,
  border: `1px solid ${theme.palette.divider}`,
}))

export const StyledViewerOrdersStepRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: theme.spacing(1.25),
}))

export const StyledViewerOrdersStepBadge = styled('span')(({ theme }) => ({
  flexShrink: 0,
  width: 22,
  height: 22,
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: theme.palette.primary.contrastText,
  backgroundColor: theme.palette.primary.main,
}))

export const StyledViewerOrdersRewardsHeader = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(1),
}))

export const StyledRewardGrid = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(2),
}))

export const StyledRewardTileBody = styled(Stack)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  gap: theme.spacing(1.5),
}))

export const StyledRewardTileBadges = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing(1),
}))

export const StyledRewardTileSwitch = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(-0.25),
  marginRight: theme.spacing(-0.5),
}))

export const StyledRewardTileReason = styled(Typography)(({ theme }) => ({
  margin: 0,
  fontSize: '0.75rem',
  lineHeight: 1.45,
  color: theme.palette.text.secondary,
}))

export const StyledRewardTile = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== 'selected' && prop !== 'disabled' && prop !== 'unavailable',
})<{ selected?: boolean; disabled?: boolean; unavailable?: boolean }>(
  ({ theme, selected, disabled, unavailable }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2, 1.75, 2, 2),
    borderRadius: theme.spacing(1.25),
    border: `1px solid ${
      selected ? theme.palette.primary.main : theme.palette.divider
    }`,
    backgroundColor: selected
      ? theme.palette.mode === 'dark'
        ? 'rgba(144, 202, 249, 0.12)'
        : 'rgba(25, 118, 210, 0.08)'
      : theme.palette.background.default,
    cursor: disabled || unavailable ? 'not-allowed' : 'pointer',
    opacity: unavailable ? 0.55 : disabled ? 0.7 : 1,
    transition: theme.transitions.create(
      ['border-color', 'background-color', 'box-shadow'],
      { duration: theme.transitions.duration.shortest },
    ),
    ...(!disabled && !unavailable && {
      '&:hover': {
        borderColor: selected
          ? theme.palette.primary.main
          : theme.palette.text.disabled,
        boxShadow: theme.shadows[1],
      },
    }),
  }),
)

export const StyledViewerOrdersLimitPanel = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  paddingTop: theme.spacing(2.5),
  borderTop: `1px solid ${theme.palette.divider}`,
}))
