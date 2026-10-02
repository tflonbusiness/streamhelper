import { EntitlementNoticesSection } from '@/components/EntitlementNoticesSection'
import {
  StyledSessionCard,
  StyledSessionCardContent,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { isOverLimit, type EntitlementEnvelope } from '@/lib/entitlements'
import type { EntitlementUsage } from '@/lib/entitlements'

type SessionEntitlementNoticesSectionProps = {
  envelope: EntitlementEnvelope | undefined
  module: keyof EntitlementUsage['sessions']
}

export function SessionEntitlementNoticesSection({
  envelope,
  module,
}: SessionEntitlementNoticesSectionProps) {
  if (!isOverLimit(envelope)) {
    return null
  }

  return (
    <StyledSessionCard elevation={0} component="section">
      <StyledSessionCardContent sx={{ py: 0, '&:last-child': { pb: 0 } }}>
        <EntitlementNoticesSection
          envelope={envelope}
          module={module}
          context="sessionDetail"
          contentInset={3}
        />
      </StyledSessionCardContent>
    </StyledSessionCard>
  )
}
