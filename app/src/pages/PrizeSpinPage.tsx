import { Grid, Stack } from '@mui/material'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { PrizeSpinHistorySection } from '@/components/prize-spin/prize-spin-page/PrizeSpinHistorySection'
import { PrizeSpinStreamWidgetSection } from '@/components/prize-spin/prize-spin-page/PrizeSpinStreamWidgetSection'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/context/AuthContext'

const PageStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(4),
}))

const ContentGrid = styled(Grid)({
  alignItems: 'flex-start',
})

const SidebarStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
  position: 'sticky',
  top: theme.spacing(2),
  width: '100%',
}))

export function PrizeSpinPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <PageStack>
      <PageHeader
        title={t('prizeSpin.title')}
        description={t('prizeSpin.description')}
        icon={AutorenewIcon}
        iconVariant="purple"
      />
      {user?.accountId !== undefined && user.accountUcid ? (
        <ContentGrid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <PrizeSpinHistorySection accountId={user.accountId} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <SidebarStack>
              <PrizeSpinStreamWidgetSection
                accountId={user.accountId}
                accountUcid={user.accountUcid}
              />
            </SidebarStack>
          </Grid>
        </ContentGrid>
      ) : null}
    </PageStack>
  )
}
