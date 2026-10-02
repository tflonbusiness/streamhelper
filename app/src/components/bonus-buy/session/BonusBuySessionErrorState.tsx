import { Button, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ModulePageShell } from '@/components/ModulePageShell'
import { ModuleSessionPageHeader } from '@/components/ModuleSessionPageHeader'
import { bonusBuyModule } from '@/components/bonus-buy/session/bonus-buy-session-utils'
import { StatusAlert } from '@/components/StatusAlert'
import { BONUS_BUY_ROUTE } from '@/lib/routes'

type BonusBuySessionErrorStateProps = {
  message: string
}

const ErrorStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
}))

export const BonusBuySessionErrorState = (
  props: BonusBuySessionErrorStateProps,
) => {
  const { t } = useTranslation()

  return (
    <ModulePageShell moduleId="bonus-buy">
      <ModuleSessionPageHeader module={bonusBuyModule} />
      <ErrorStack>
      <StatusAlert tone="error">{props.message}</StatusAlert>
      <Button component={Link} to={BONUS_BUY_ROUTE} variant="outlined">
        {t('common.backToSessions')}
      </Button>
      </ErrorStack>
    </ModulePageShell>
  )
}
