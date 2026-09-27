import { Stack } from '@mui/material'
import { useTranslation } from 'react-i18next'
import DashboardIcon from '@mui/icons-material/Dashboard'
import { DashboardTariffCard } from '@/components/DashboardTariffCard'
import { DashboardWelcomeBanner } from '@/components/DashboardWelcomeBanner'
import { KickChannelStatsSection } from '@/components/KickChannelStatsSection'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/context/AuthContext'

export function DashboardHomePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const hasAccount = Boolean(user?.accountId)

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
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
