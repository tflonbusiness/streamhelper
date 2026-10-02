import { Grid, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { BonusBuyHistorySection } from '@/components/bonus-buy/bonus-buy-page/BonusBuyHistorySection'
import { BonusBuyStreamWidgetSection } from '@/components/bonus-buy/bonus-buy-page/BonusBuyStreamWidgetSection'
import { ModulePageHeader } from '@/components/ModulePageHeader'
import { ModulePageShell } from '@/components/ModulePageShell'
import { useAuth } from '@/context/AuthContext'

const ContentGrid = styled(Grid)({
  alignItems: 'flex-start',
})

const SidebarStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
  position: 'sticky',
  top: theme.spacing(2),
  width: '100%',
}))

export function BonusBuyPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <ModulePageShell moduleId="bonus-buy">
      <ModulePageHeader
        moduleId="bonus-buy"
        title={t('bonusBuy.title')}
        description={t('bonusBuy.description')}
      />
      {user?.accountId !== undefined && user.accountUcid ? (
        <ContentGrid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <BonusBuyHistorySection accountId={user.accountId} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <SidebarStack>
              <BonusBuyStreamWidgetSection
                accountId={user.accountId}
                accountUcid={user.accountUcid}
              />
            </SidebarStack>
          </Grid>
        </ContentGrid>
      ) : null}
    </ModulePageShell>
  )
}
