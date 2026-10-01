import { useTranslation } from 'react-i18next'
import { entitlementAlertSx } from '@/components/entitlementAlertStyles'
import { StatusAlert } from '@/components/StatusAlert'
import type { EntitlementEnvelope, EntitlementUsage } from '@/lib/entitlements'
import { isOverLimit } from '@/lib/entitlements'

type EntitlementOverLimitAlertProps = {
  envelope: EntitlementEnvelope | undefined
  module?: keyof EntitlementUsage['sessions']
}

export function EntitlementOverLimitAlert({
  envelope,
  module,
}: EntitlementOverLimitAlertProps) {
  const { t } = useTranslation()

  if (!isOverLimit(envelope)) {
    return null
  }

  const limit = envelope.entitlements.limits.sessionsPerModule
  const usage =
    module !== undefined ? envelope.usage.sessions[module] : undefined
  const sessionModuleMessage =
    module !== undefined &&
    limit !== null &&
    limit !== undefined &&
    usage !== undefined

  const title = sessionModuleMessage
    ? t('subscription.entitlements.overLimitSessionTitle')
    : t('subscription.entitlements.overLimitTitle')

  const body = sessionModuleMessage
    ? t('subscription.entitlements.overLimitSessionBody', { limit, usage })
    : t('subscription.entitlements.overLimitBody')

  return (
    <StatusAlert tone="error" title={title} sx={entitlementAlertSx}>
      {body}
    </StatusAlert>
  )
}
