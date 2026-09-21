import { CircularProgress, Stack } from '@mui/material'
import CasinoIcon from '@mui/icons-material/Casino'
import { styled } from '@mui/material/styles'
import { PageHeader } from '@/components/PageHeader'

const PageStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(4),
  alignItems: 'center',
  paddingTop: theme.spacing(8),
}))

export const ChatRollSessionLoadingState = () => {
  return (
    <PageStack>
      <PageHeader
        title="Chat Roll"
        description="Weighted chat giveaway for your stream"
        icon={CasinoIcon}
        iconVariant="info"
      />
      <CircularProgress size={32} />
    </PageStack>
  )
}
