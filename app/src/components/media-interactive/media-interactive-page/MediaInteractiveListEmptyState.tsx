import type { SvgIconComponent } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'

type MediaInteractiveListEmptyStateProps = {
  icon: SvgIconComponent
  title: string
  description: string
}

const StyledRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(3, 2),
  textAlign: 'center',
  borderRadius: theme.spacing(1.25),
  border: `1px dashed ${alpha(theme.palette.text.primary, 0.16)}`,
  backgroundColor: alpha(theme.palette.text.primary, 0.02),
}))

const StyledIconWrap = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: theme.spacing(1),
  backgroundColor: alpha(theme.palette.text.primary, 0.05),
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(0.5),
  '& .MuiSvgIcon-root': {
    fontSize: 22,
  },
}))

export function MediaInteractiveListEmptyState({
  icon: Icon,
  title,
  description,
}: MediaInteractiveListEmptyStateProps) {
  return (
    <StyledRoot>
      <StyledIconWrap aria-hidden>
        <Icon />
      </StyledIconWrap>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 320, lineHeight: 1.5 }}
      >
        {description}
      </Typography>
    </StyledRoot>
  )
}
