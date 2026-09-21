import { Button, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { bonusBuyModule } from '@/components/bonus-buy/session/bonus-buy-session-utils'
import { StatusAlert } from '@/components/StatusAlert'

type BonusBuySessionErrorStateProps = {
  message: string
}

const PageStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(4),
}))

export const BonusBuySessionErrorState = (
  props: BonusBuySessionErrorStateProps,
) => {
  return (
    <PageStack>
      <PageHeader
        title={bonusBuyModule.name}
        description={bonusBuyModule.description}
        icon={bonusBuyModule.icon}
        iconVariant={bonusBuyModule.iconVariant}
      />
      <StatusAlert tone="error">{props.message}</StatusAlert>
      <Button component={Link} to="/bonus-buy" variant="outlined">
        Back to history
      </Button>
    </PageStack>
  )
}
