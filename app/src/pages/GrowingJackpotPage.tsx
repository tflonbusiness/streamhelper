import { Grid, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { GrowingJackpotHistorySection } from '@/components/growing-jackpot/GrowingJackpotHistorySection'
import { GrowingJackpotStreamWidgetSection } from '@/components/growing-jackpot/GrowingJackpotStreamWidgetSection'
import { ModulePageHeader } from '@/components/ModulePageHeader'
import { ModulePageShell } from '@/components/ModulePageShell'
import { useAuth } from '@/context/AuthContext'

const ContentGrid = styled(Grid)({
  alignItems: 'flex-start',
  width: '100%',
})

const SidebarStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
  position: 'sticky',
  top: theme.spacing(2),
  width: '100%',
}))

export function GrowingJackpotPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <ModulePageShell moduleId="growing-jackpot">
      <ModulePageHeader
        moduleId="growing-jackpot"
        title={t('growingJackpot.title')}
        description={t('growingJackpot.description')}
      />
      {user?.accountId !== undefined && user.accountUcid ? (
        <ContentGrid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <GrowingJackpotHistorySection accountId={user.accountId} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <SidebarStack>
              <GrowingJackpotStreamWidgetSection
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
