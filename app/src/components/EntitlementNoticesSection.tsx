import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { styled, alpha } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { EntitlementOverLimitAlert } from '@/components/EntitlementOverLimitAlert'
import { EntitlementSessionCapAlert } from '@/components/EntitlementSessionCapAlert'
import {
  isAtSessionCap,
  isOverLimit,
  type EntitlementEnvelope,
  type EntitlementUsage,
} from '@/lib/entitlements'

type NoticeSeverity = 'error' | 'info'

type EntitlementNoticesSectionProps = {
  envelope: EntitlementEnvelope | undefined
  module: keyof EntitlementUsage['sessions']
}

const StyledNoticesBand = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'severity',
})<{ severity: NoticeSeverity }>(({ theme, severity }) => {
  const main =
    severity === 'error'
      ? theme.palette.error.main
      : theme.palette.info.main

  return {
    boxSizing: 'border-box',
    width: `calc(100% + ${theme.spacing(6)})`,
    marginLeft: theme.spacing(-3),
    marginRight: theme.spacing(-3),
    padding: theme.spacing(1.25, 3, 1.5),
    backgroundColor: alpha(main, 0.06),
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
  }
})

export function EntitlementNoticesSection({
  envelope,
  module,
}: EntitlementNoticesSectionProps) {
  const { t } = useTranslation()

  const showOverLimit = isOverLimit(envelope)
  const showSessionCap =
    Boolean(envelope) && !showOverLimit && isAtSessionCap(envelope, module)

  if (!showOverLimit && !showSessionCap) {
    return null
  }

  const severity: NoticeSeverity = showOverLimit ? 'error' : 'info'

  return (
    <StyledNoticesBand
      component="section"
      severity={severity}
      aria-label={t('subscription.entitlements.noticesSectionAria')}
    >
      <Stack spacing={1}>
        {showOverLimit ? (
          <EntitlementOverLimitAlert envelope={envelope} module={module} />
        ) : null}
        {showSessionCap ? (
          <EntitlementSessionCapAlert envelope={envelope} module={module} />
        ) : null}
      </Stack>
    </StyledNoticesBand>
  )
}
