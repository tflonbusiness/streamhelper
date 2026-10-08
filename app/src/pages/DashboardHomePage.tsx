import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'react-i18next'
import DashboardIcon from '@mui/icons-material/Dashboard'
import { DashboardModuleQuickAccess } from '@/components/DashboardModuleQuickAccess'
import { DashboardSubscriptionBanner } from '@/components/DashboardSubscriptionBanner'
import { DashboardWelcomeBanner } from '@/components/DashboardWelcomeBanner'
import { accountHasSubscriptionAccess } from '@/lib/account-subscription'
import { KickChannelStatsSection } from '@/components/KickChannelStatsSection'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/context/AuthContext'
import { MODULE_PAGE_SECTION_SPACING } from '@/lib/module-page-layout'

export function DashboardHomePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const hasAccount = Boolean(user?.accountId)
  const hasSubscriptionAccess = accountHasSubscriptionAccess(user)

  return (
    <Stack spacing={MODULE_PAGE_SECTION_SPACING} sx={{ pb: 2 }}>
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
            gap: 3,
            alignItems: 'stretch',
          }}
        >
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            <DashboardWelcomeBanner user={user} />
            <DashboardModuleQuickAccess />
          </Stack>

          <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <KickChannelStatsSection accountId={user.accountId} layout="sidebar" />
          </Box>
        </Box>
      ) : null}
    </Stack>
  )
}
