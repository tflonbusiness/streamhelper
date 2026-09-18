import { Stack } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import { DashboardTariffCard } from '@/components/DashboardTariffCard'
import { DashboardWelcomeBanner } from '@/components/DashboardWelcomeBanner'
import { KickChannelStatsSection } from '@/components/KickChannelStatsSection'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/context/AuthContext'

export function DashboardHomePage() {
  const { user } = useAuth()
  const hasAccount = Boolean(user?.accountId)

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Home"
        description="Team overview and activity"
        icon={DashboardIcon}
        iconVariant="primary"
      />

      {hasAccount && user?.accountId ? (
        <DashboardWelcomeBanner
          accountId={user.accountId}
          accountName={user.accountName}
          role={user.role}
        />
      ) : null}

      {hasAccount ? (
        <DashboardTariffCard
          subscriptionPlan={user?.subscriptionPlan}
          showSubscriptionLink={user?.role === 'owner'}
        />
      ) : null}

      {user?.accountId ? (
        <KickChannelStatsSection accountId={user.accountId} />
      ) : null}
    </Stack>
  )
}
