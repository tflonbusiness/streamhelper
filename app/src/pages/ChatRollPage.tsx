import { Stack } from '@mui/material'
import CasinoIcon from '@mui/icons-material/Casino'
import { useTranslation } from 'react-i18next'
import { ChatRollHistorySection } from '@/components/chat-roll/chat-roll-page/ChatRollHistorySection'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/context/AuthContext'

export function ChatRollPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <Stack spacing={4}>
      <PageHeader
        title={t('chatRoll.title')}
        description={t('chatRoll.description')}
        icon={CasinoIcon}
        iconVariant="info"
      />
      {user?.accountId !== undefined ? (
        <ChatRollHistorySection accountId={user.accountId} />
      ) : null}
    </Stack>
  )
}
