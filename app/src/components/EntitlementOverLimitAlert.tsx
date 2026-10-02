import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { entitlementAlertSx } from '@/components/entitlementAlertStyles'
import { StatusAlert } from '@/components/StatusAlert'
import type { EntitlementEnvelope, EntitlementUsage } from '@/lib/entitlements'
import {
  getEntitlementOverLimitIssues,
  isOverLimit,
  type EntitlementOverLimitIssue,
} from '@/lib/entitlements'

export type EntitlementOverLimitAlertContext = 'moduleList' | 'sessionDetail'

type EntitlementOverLimitAlertProps = {
  envelope: EntitlementEnvelope | undefined
  module?: keyof EntitlementUsage['sessions']
  context?: EntitlementOverLimitAlertContext
}

function resolveIssueCopy(
  issue: EntitlementOverLimitIssue,
  context: EntitlementOverLimitAlertContext,
  t: TFunction,
): { title: string; body: string } {
  const { usage, limit } = issue

  switch (issue.kind) {
    case 'moduleSessions': {
      const moduleKey = issue.module ?? 'bonusBuy'
      return {
        title: t('subscription.entitlements.overLimitIssues.moduleSessions.title'),
        body:
          context === 'sessionDetail'
            ? t(
                `subscription.entitlements.overLimitIssues.moduleSessions.bodySession.${moduleKey}`,
                { usage, limit },
              )
            : t(
                `subscription.entitlements.overLimitIssues.moduleSessions.bodyList.${moduleKey}`,
                { usage, limit },
              ),
      }
    }
    case 'bonusBuySlots':
      return {
        title: t('subscription.entitlements.overLimitIssues.bonusBuySlots.title'),
        body: t('subscription.entitlements.overLimitIssues.bonusBuySlots.body', {
          usage,
          limit,
        }),
      }
    case 'prizeSpinSectors':
      return {
        title: t(
          'subscription.entitlements.overLimitIssues.prizeSpinSectors.title',
        ),
        body: t(
          'subscription.entitlements.overLimitIssues.prizeSpinSectors.body',
          { usage, limit },
        ),
      }
    case 'moderatorMembers':
      return {
        title: t(
          'subscription.entitlements.overLimitIssues.moderatorMembers.title',
        ),
        body: t(
          'subscription.entitlements.overLimitIssues.moderatorMembers.body',
          { usage, limit },
        ),
      }
    default:
      return {
        title: t('subscription.entitlements.overLimitTitle'),
        body: t('subscription.entitlements.overLimitBody'),
      }
  }
}

function OverLimitAlertMessage({
  body,
  limitedNotice,
}: {
  body: string
  limitedNotice: string
}) {
  return (
    <Typography component="span" variant="body2" sx={{ color: 'inherit', display: 'block' }}>
      {body}
      <Typography
        component="span"
        variant="body2"
        sx={{ display: 'block', mt: 0.5, color: 'inherit' }}
      >
        {limitedNotice}
      </Typography>
    </Typography>
  )
}

export function EntitlementOverLimitAlert({
  envelope,
  module,
  context = 'moduleList',
}: EntitlementOverLimitAlertProps) {
  const { t } = useTranslation()

  if (!isOverLimit(envelope)) {
    return null
  }

  const issues = getEntitlementOverLimitIssues(envelope, module)
  const limitedNotice = t(
    context === 'sessionDetail'
      ? 'subscription.entitlements.overLimitIssues.functionalityLimitedSessionDetail'
      : 'subscription.entitlements.overLimitIssues.functionalityLimited',
  )

  if (issues.length === 0) {
    return (
      <StatusAlert tone="error" title={t('subscription.entitlements.overLimitTitle')} sx={entitlementAlertSx}>
        <OverLimitAlertMessage
          body={t('subscription.entitlements.overLimitBody')}
          limitedNotice={limitedNotice}
        />
      </StatusAlert>
    )
  }

  if (issues.length === 1) {
    const copy = resolveIssueCopy(issues[0], context, t)
    return (
      <StatusAlert tone="error" title={copy.title} sx={entitlementAlertSx}>
        <OverLimitAlertMessage body={copy.body} limitedNotice={limitedNotice} />
      </StatusAlert>
    )
  }

  return (
    <Stack spacing={1.5}>
      {issues.map((issue) => {
        const copy = resolveIssueCopy(issue, context, t)
        const key = `${issue.kind}-${issue.module ?? 'account'}`
        return (
          <StatusAlert key={key} tone="error" title={copy.title} sx={entitlementAlertSx}>
            <OverLimitAlertMessage body={copy.body} limitedNotice={limitedNotice} />
          </StatusAlert>
        )
      })}
    </Stack>
  )
}
