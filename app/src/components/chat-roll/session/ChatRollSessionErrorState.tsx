import { Button, Stack, Typography } from '@mui/material'
import CasinoIcon from '@mui/icons-material/Casino'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { CHAT_ROLL_ROUTE } from '@/lib/routes'

const PageStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(4),
  alignItems: 'center',
  paddingTop: theme.spacing(8),
}))

type ChatRollSessionErrorStateProps = {
  message: string
}

export const ChatRollSessionErrorState = ({
  message,
}: ChatRollSessionErrorStateProps) => {
  const { t } = useTranslation()

  return (
    <PageStack>
      <PageHeader
        title={t('chatRoll.title')}
        description={t('chatRoll.sessionDescription')}
        icon={CasinoIcon}
        iconVariant="info"
      />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
      <Button component={Link} to={CHAT_ROLL_ROUTE} variant="outlined">
        {t('chatRoll.backToList')}
      </Button>
    </PageStack>
  )
}
