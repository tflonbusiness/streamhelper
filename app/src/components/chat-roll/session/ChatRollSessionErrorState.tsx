import { Button, Stack, Typography } from '@mui/material'
import CasinoIcon from '@mui/icons-material/Casino'
import { styled } from '@mui/material/styles'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'

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
  return (
    <PageStack>
      <PageHeader
        title="Chat Roll"
        description="Weighted chat giveaway for your stream"
        icon={CasinoIcon}
        iconVariant="info"
      />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
      <Button component={Link} to="/chat-roll" variant="outlined">
        Back to Chat Roll
      </Button>
    </PageStack>
  )
}
