import { useTranslation } from 'react-i18next'
import { entitlementAlertSx } from '@/components/entitlementAlertStyles'
import { StatusAlert } from '@/components/StatusAlert'
import {
  isAtSessionCap,
  isOverLimit,
  type EntitlementEnvelope,
  type EntitlementUsage,
} from '@/lib/entitlements'

type EntitlementSessionCapAlertProps = {
  envelope: EntitlementEnvelope | undefined
  module: keyof EntitlementUsage['sessions']
}

export function EntitlementSessionCapAlert({
  envelope,
  module,
}: EntitlementSessionCapAlertProps) {
  const { t } = useTranslation()

  if (!envelope || isOverLimit(envelope) || !isAtSessionCap(envelope, module)) {
    return null
  }

  const limit = envelope.entitlements.limits.sessionsPerModule
  if (limit === null || limit === undefined) {
    return null
  }

  const bodyKey =
    module === 'prizeSpin'
      ? 'subscription.entitlements.sessionCap.bodyPrizeSpin'
      : 'subscription.entitlements.sessionCap.body'

  return (
    <StatusAlert
      tone="info"
      title={t('subscription.entitlements.sessionCap.title')}
      sx={entitlementAlertSx}
    >
      {t(bodyKey, { limit })}
    </StatusAlert>
  )
}
