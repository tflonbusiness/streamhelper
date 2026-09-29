import { alpha, styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

const StyledSessionIdBadge = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 28,
  height: 24,
  paddingLeft: theme.spacing(0.75),
  paddingRight: theme.spacing(0.75),
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1,
  color: theme.palette.text.secondary,
  backgroundColor: alpha(theme.palette.text.primary, 0.06),
  border: '1px solid',
  borderColor: alpha(theme.palette.text.primary, 0.1),
  flexShrink: 0,
}))

type ChatRollSessionIdBadgeProps = {
  sessionId: number
  'aria-hidden'?: boolean
}

export function ChatRollSessionIdBadge({
  sessionId,
  'aria-hidden': ariaHidden,
}: ChatRollSessionIdBadgeProps) {
  const { t } = useTranslation()
  const label = t('chatRoll.historyCardIndex', { index: sessionId })

  return (
    <StyledSessionIdBadge aria-hidden={ariaHidden} aria-label={ariaHidden ? undefined : label}>
      {label}
    </StyledSessionIdBadge>
  )
}
