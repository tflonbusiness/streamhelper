import { CircularProgress, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { chatRollModule } from '@/components/chat-roll/session/chat-roll-session-utils'
import { ModuleSessionPageHeader } from '@/components/ModuleSessionPageHeader'

const PageStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(4),
  alignItems: 'center',
  paddingTop: theme.spacing(8),
}))

export const ChatRollSessionLoadingState = () => {
  return (
    <PageStack>
      <ModuleSessionPageHeader module={chatRollModule} />
      <CircularProgress size={32} />
    </PageStack>
  )
}
