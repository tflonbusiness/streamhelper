import { Grid, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { ChatRollHistorySection } from '@/components/chat-roll/chat-roll-page/ChatRollHistorySection'
import { ChatRollStreamWidgetSection } from '@/components/chat-roll/chat-roll-page/ChatRollStreamWidgetSection'
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

export function ChatRollPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <ModulePageShell moduleId="chat-roll">
      <ModulePageHeader
        moduleId="chat-roll"
        title={t('chatRoll.title')}
        description={t('chatRoll.description')}
      />
      {user?.accountId !== undefined && user.accountUcid ? (
        <ContentGrid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <ChatRollHistorySection accountId={user.accountId} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <SidebarStack>
              <ChatRollStreamWidgetSection
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
