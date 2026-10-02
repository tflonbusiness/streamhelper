import Box from '@mui/material/Box'
import { styled, alpha } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { EntitlementOverLimitAlert } from '@/components/EntitlementOverLimitAlert'
import type { EntitlementOverLimitAlertContext } from '@/components/EntitlementOverLimitAlert'
import type {
  EntitlementEnvelope,
  EntitlementUsage,
} from '@/lib/entitlements'
import { isOverLimit } from '@/lib/entitlements'

type EntitlementNoticesSectionProps = {
  envelope: EntitlementEnvelope | undefined
  /** When set, session-module copy is used for over-limit body. */
  module?: keyof EntitlementUsage['sessions']
  context?: EntitlementOverLimitAlertContext
  /** Card content padding to bleed the band edge-to-edge (history cards use 3). */
  contentInset?: 2 | 3
}

const StyledNoticesBand = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'contentInset',
})<{ contentInset: 2 | 3 }>(({ theme, contentInset }) => {
  const bleedWidth = theme.spacing(contentInset * 2)
  const main = theme.palette.error.main

  return {
    boxSizing: 'border-box',
    width: `calc(100% + ${bleedWidth})`,
    marginLeft: theme.spacing(-contentInset),
    marginRight: theme.spacing(-contentInset),
    padding: theme.spacing(1.25, contentInset, 1.5),
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
  context = 'moduleList',
  contentInset = 3,
}: EntitlementNoticesSectionProps) {
  const { t } = useTranslation()

  if (!isOverLimit(envelope)) {
    return null
  }

  return (
    <StyledNoticesBand
      component="section"
      contentInset={contentInset}
      aria-label={t('subscription.entitlements.noticesSectionAria')}
    >
      <EntitlementOverLimitAlert
        envelope={envelope}
        module={module}
        context={context}
      />
    </StyledNoticesBand>
  )
}
