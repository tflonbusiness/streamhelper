import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'react-i18next'
import DashboardIcon from '@mui/icons-material/Dashboard'
import { DashboardModuleQuickAccess } from '@/components/DashboardModuleQuickAccess'
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
    <Stack spacing={4} sx={{ pb: 2 }}>
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
        icon={DashboardIcon}
        iconVariant="primary"
      />

      {hasAccount ? <DashboardSubscriptionBanner user={user} /> : null}

      {hasAccount && user?.accountId && hasSubscriptionAccess ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'minmax(0, 1fr) minmax(300px, 400px)',
            },
            gap: 2.5,
            alignItems: 'start',
          }}
        >
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            <DashboardWelcomeBanner
              accountId={user.accountId}
              accountName={user.accountName}
              role={user.role}
            />
            <DashboardModuleQuickAccess />
          </Stack>

          <Stack spacing={2.5} sx={{ minWidth: 0 }}>
            <KickChannelStatsSection accountId={user.accountId} layout="sidebar" />
            <DashboardTariffCard subscriptionPlan={user?.subscriptionPlan} />
          </Stack>
        </Box>
      ) : null}
    </Stack>
  )
}
