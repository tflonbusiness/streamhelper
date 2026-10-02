import { useTranslation } from 'react-i18next'
import { entitlementAlertSx } from '@/components/entitlementAlertStyles'
import { StatusAlert } from '@/components/StatusAlert'
import {
  isAtModeratorCap,
  isOverLimit,
  type EntitlementEnvelope,
} from '@/lib/entitlements'

type EntitlementModeratorCapAlertProps = {
  envelope: EntitlementEnvelope | undefined
}

export function EntitlementModeratorCapAlert({
  envelope,
}: EntitlementModeratorCapAlertProps) {
  const { t } = useTranslation()

  if (!envelope || isOverLimit(envelope) || !isAtModeratorCap(envelope)) {
    return null
  }

  const limit = envelope.entitlements.limits.moderatorMembers
  if (limit === null || limit === undefined) {
    return null
  }

  return (
    <StatusAlert
      tone="info"
      title={t('subscription.entitlements.moderatorCap.title')}
      sx={entitlementAlertSx}
    >
      {t('subscription.entitlements.moderatorCap.body', { limit })}
    </StatusAlert>
  )
}
