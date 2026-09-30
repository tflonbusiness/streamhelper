import { Stack } from '@mui/material'
import { useTranslation } from 'react-i18next'
import DashboardIcon from '@mui/icons-material/Dashboard'
import { DashboardSubscriptionBanner } from '@/components/DashboardSubscriptionBanner'
import { DashboardTariffCard } from '@/components/DashboardTariffCard'
import { DashboardWelcomeBanner } from '@/components/DashboardWelcomeBanner'
import { accountHasSubscriptionAccess } from '@/lib/account-subscription'
import { KickChannelStatsSection } from '@/components/KickChannelStatsSection'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/context/AuthContext'

export function DashboardHomePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const hasAccount = Boolean(user?.accountId)
  const hasSubscriptionAccess = accountHasSubscriptionAccess(user)

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
        icon={DashboardIcon}
        iconVariant="primary"
      />

      {hasAccount ? <DashboardSubscriptionBanner user={user} /> : null}

      {hasAccount && user?.accountId && hasSubscriptionAccess ? (
        <DashboardWelcomeBanner
          accountId={user.accountId}
          accountName={user.accountName}
          role={user.role}
        />
      ) : null}

      {hasAccount && hasSubscriptionAccess ? (
        <DashboardTariffCard subscriptionPlan={user?.subscriptionPlan} />
      ) : null}

      {user?.accountId && hasSubscriptionAccess ? (
        <KickChannelStatsSection accountId={user.accountId} />
      ) : null}
    </Stack>
  )
}
