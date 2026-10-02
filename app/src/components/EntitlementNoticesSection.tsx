import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { styled, alpha } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { EntitlementOverLimitAlert } from '@/components/EntitlementOverLimitAlert'
import type { EntitlementOverLimitAlertContext } from '@/components/EntitlementOverLimitAlert'
import { EntitlementModeratorCapAlert } from '@/components/EntitlementModeratorCapAlert'
import { EntitlementSessionCapAlert } from '@/components/EntitlementSessionCapAlert'
import {
  isAtModeratorCap,
  isAtSessionCap,
  isOverLimit,
  type EntitlementEnvelope,
  type EntitlementUsage,
} from '@/lib/entitlements'

type NoticeSeverity = 'error' | 'info'

type EntitlementNoticesSectionProps = {
  envelope: EntitlementEnvelope | undefined
  /** When set, session-module copy is used for over-limit body. */
  module?: keyof EntitlementUsage['sessions']
  context?: EntitlementOverLimitAlertContext
  /** Card content padding to bleed the band edge-to-edge (history cards use 3). */
  contentInset?: 2 | 3
  /** Team page: moderator limits only (no module session cap). */
  variant?: 'module' | 'team'
  /** Standalone: full-width band above a card (no negative bleed). */
  placement?: 'embedded' | 'standalone'
}

const StyledNoticesBand = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== 'severity' &&
    prop !== 'contentInset' &&
    prop !== 'placement',
})<{
  severity: NoticeSeverity
  contentInset: 2 | 3
  placement: 'embedded' | 'standalone'
}>(
  ({ theme, severity, contentInset, placement }) => {
    const main =
      severity === 'error'
        ? theme.palette.error.main
        : theme.palette.info.main

    const embeddedBleed =
      placement === 'embedded'
        ? {
            boxSizing: 'border-box' as const,
            width: `calc(100% + ${theme.spacing(contentInset * 2)})`,
            marginLeft: theme.spacing(-contentInset),
            marginRight: theme.spacing(-contentInset),
          }
        : {
            boxSizing: 'border-box' as const,
            width: '100%',
            border: '1px solid',
            borderColor: theme.palette.divider,
            borderRadius: theme.shape.borderRadius,
          }

    return {
      ...embeddedBleed,
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
  },
)

export function EntitlementNoticesSection({
  envelope,
  module,
  context = 'moduleList',
  contentInset = 3,
  variant = 'module',
  placement = 'embedded',
}: EntitlementNoticesSectionProps) {
  const { t } = useTranslation()

  const showOverLimit = isOverLimit(envelope)
  const showSessionCap =
    variant === 'module' &&
    context === 'moduleList' &&
    module !== undefined &&
    Boolean(envelope) &&
    !showOverLimit &&
    isAtSessionCap(envelope, module)
  const showModeratorCap =
    variant === 'team' &&
    Boolean(envelope) &&
    !showOverLimit &&
    isAtModeratorCap(envelope)

  if (!showOverLimit && !showSessionCap && !showModeratorCap) {
    return null
  }

  const severity: NoticeSeverity =
    showOverLimit ? 'error' : 'info'

  return (
    <StyledNoticesBand
      component="section"
      severity={severity}
      contentInset={contentInset}
      placement={placement}
      aria-label={t('subscription.entitlements.noticesSectionAria')}
    >
      <Stack spacing={1}>
        {showOverLimit ? (
          <EntitlementOverLimitAlert
            envelope={envelope}
            module={module}
            context={context}
            issueKinds={variant === 'team' ? ['moderatorMembers'] : undefined}
          />
        ) : null}
        {showSessionCap && module !== undefined ? (
          <EntitlementSessionCapAlert envelope={envelope} module={module} />
        ) : null}
        {showModeratorCap ? (
          <EntitlementModeratorCapAlert envelope={envelope} />
        ) : null}
      </Stack>
    </StyledNoticesBand>
  )
}
