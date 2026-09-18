import { Button, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { prizeSpinModule } from '@/components/prize-spin/session/prize-spin-session-utils'
import { StatusAlert } from '@/components/StatusAlert'

type PrizeSpinSessionErrorStateProps = {
  message: string
}

const PageStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(4),
}))

export const PrizeSpinSessionErrorState = (
  props: PrizeSpinSessionErrorStateProps,
) => {
  return (
    <PageStack>
      <PageHeader
        title={prizeSpinModule.name}
        description={prizeSpinModule.description}
        icon={prizeSpinModule.icon}
        iconVariant={prizeSpinModule.iconVariant}
      />
      <StatusAlert tone="error">{props.message}</StatusAlert>
      <Button component={Link} to="/prize-spin" variant="outlined">
        Back to history
      </Button>
    </PageStack>
  )
}
