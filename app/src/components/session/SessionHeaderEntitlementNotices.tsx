import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { EntitlementNoticesSection } from '@/components/EntitlementNoticesSection'
import type {
  EntitlementEnvelope,
  EntitlementUsage,
} from '@/lib/entitlements'

type SessionHeaderEntitlementNoticesProps = {
  envelope: EntitlementEnvelope | undefined
  module: keyof EntitlementUsage['sessions']
}

const NoticesWrap = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  width: '100%',
}))

export function SessionHeaderEntitlementNotices({
  envelope,
  module,
}: SessionHeaderEntitlementNoticesProps) {
  return (
    <NoticesWrap>
      <EntitlementNoticesSection
        envelope={envelope}
        module={module}
        contentInset={2}
      />
    </NoticesWrap>
  )
}
