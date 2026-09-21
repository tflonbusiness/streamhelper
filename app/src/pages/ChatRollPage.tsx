import { Stack } from '@mui/material'
import CasinoIcon from '@mui/icons-material/Casino'
import { ChatRollHistorySection } from '@/components/chat-roll/chat-roll-page/ChatRollHistorySection'
import { ChatRollStreamWidgetSection } from '@/components/chat-roll/chat-roll-page/ChatRollStreamWidgetSection'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/context/AuthContext'

export function ChatRollPage() {
  const { user } = useAuth()

  return (
    <Stack spacing={4}>
      <PageHeader
        title="Chat Roll"
        description="Weighted chat giveaway for your stream"
        icon={CasinoIcon}
        iconVariant="info"
      />
      {user?.accountId !== undefined ? (
        <ChatRollStreamWidgetSection accountId={user.accountId} />
      ) : null}
      {user?.accountId !== undefined ? (
        <ChatRollHistorySection accountId={user.accountId} />
      ) : null}
    </Stack>
  )
}
