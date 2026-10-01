import { Grid, Stack } from '@mui/material'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { BonusBuyHistorySection } from '@/components/bonus-buy/bonus-buy-page/BonusBuyHistorySection'
import { BonusBuyStreamWidgetSection } from '@/components/bonus-buy/bonus-buy-page/BonusBuyStreamWidgetSection'
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

export function BonusBuyPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <PageStack>
      <PageHeader
        title={t('bonusBuy.title')}
        description={t('bonusBuy.description')}
        icon={CardGiftcardIcon}
        iconVariant="info"
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
    </PageStack>
  )
}
