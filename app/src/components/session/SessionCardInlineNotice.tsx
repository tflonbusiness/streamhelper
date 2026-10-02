import Box from '@mui/material/Box'
import { alpha, styled } from '@mui/material/styles'
import { entitlementAlertSx } from '@/components/entitlementAlertStyles'
import { StatusAlert } from '@/components/StatusAlert'

const InfoBand = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  boxSizing: 'border-box',
  width: `calc(100% + ${theme.spacing(4)})`,
  marginLeft: theme.spacing(-2),
  marginRight: theme.spacing(-2),
  padding: theme.spacing(1.25, 2, 1.5),
  backgroundColor: alpha(theme.palette.info.main, 0.06),
  '& .MuiAlert-root': {
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
  },
  '& .MuiAlert-message': {
    py: 0,
    fontSize: '0.8125rem',
    lineHeight: 1.5,
    color: theme.palette.text.secondary,
  },
}))

type SessionCardInlineNoticeProps = {
  children: React.ReactNode
}

export function SessionCardInlineNotice({
  children,
}: SessionCardInlineNoticeProps) {
  return (
    <InfoBand>
      <StatusAlert tone="info" sx={entitlementAlertSx}>
        {children}
      </StatusAlert>
    </InfoBand>
  )
}
