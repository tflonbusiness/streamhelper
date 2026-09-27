import { CircularProgress, Stack } from '@mui/material'
import CasinoIcon from '@mui/icons-material/Casino'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/PageHeader'

const PageStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(4),
  alignItems: 'center',
  paddingTop: theme.spacing(8),
}))

export const ChatRollSessionLoadingState = () => {
  const { t } = useTranslation()

  return (
    <PageStack>
      <PageHeader
        title={t('chatRoll.title')}
        description={t('chatRoll.sessionDescription')}
        icon={CasinoIcon}
        iconVariant="info"
      />
      <CircularProgress size={32} />
    </PageStack>
  )
}
