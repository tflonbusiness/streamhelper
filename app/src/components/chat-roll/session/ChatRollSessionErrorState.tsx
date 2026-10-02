import { Button, Stack, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ModulePageHeader } from '@/components/ModulePageHeader'
import { ModulePageShell } from '@/components/ModulePageShell'
import { CHAT_ROLL_ROUTE } from '@/lib/routes'

const ErrorStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
  alignItems: 'flex-start',
}))

type ChatRollSessionErrorStateProps = {
  message: string
}

export const ChatRollSessionErrorState = ({
  message,
}: ChatRollSessionErrorStateProps) => {
  const { t } = useTranslation()

  return (
    <ModulePageShell moduleId="chat-roll">
      <ModulePageHeader
        moduleId="chat-roll"
        title={t('chatRoll.title')}
        description={t('chatRoll.sessionDescription')}
      />
      <ErrorStack>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
        <Button component={Link} to={CHAT_ROLL_ROUTE} variant="outlined">
          {t('common.backToSessions')}
        </Button>
      </ErrorStack>
    </ModulePageShell>
  )
}
