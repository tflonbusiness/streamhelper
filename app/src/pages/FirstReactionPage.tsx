import { Grid, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { FirstReactionHistorySection } from '@/components/first-reaction/first-reaction-page/FirstReactionHistorySection'
import { FirstReactionStreamWidgetSection } from '@/components/first-reaction/FirstReactionStreamWidgetSection'
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

export function FirstReactionPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <ModulePageShell moduleId="first-reaction">
      <ModulePageHeader
        moduleId="first-reaction"
        title={t('firstReaction.title')}
        description={t('firstReaction.description')}
      />
      {user?.accountId !== undefined && user.accountUcid ? (
        <ContentGrid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <FirstReactionHistorySection accountId={user.accountId} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <SidebarStack>
              <FirstReactionStreamWidgetSection
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
