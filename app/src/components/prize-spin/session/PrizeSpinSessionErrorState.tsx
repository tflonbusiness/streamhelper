import { Button, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ModulePageShell } from '@/components/ModulePageShell'
import { ModuleSessionPageHeader } from '@/components/ModuleSessionPageHeader'
import { prizeSpinModule } from '@/components/prize-spin/session/prize-spin-session-utils'
import { StatusAlert } from '@/components/StatusAlert'
import { PRIZE_SPIN_ROUTE } from '@/lib/routes'

type PrizeSpinSessionErrorStateProps = {
  message: string
}

const ErrorStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
}))

export const PrizeSpinSessionErrorState = (
  props: PrizeSpinSessionErrorStateProps,
) => {
  const { t } = useTranslation()

  return (
    <ModulePageShell moduleId="prize-spin">
      <ModuleSessionPageHeader module={prizeSpinModule} />
      <ErrorStack>
        <StatusAlert tone="error">{props.message}</StatusAlert>
        <Button component={Link} to={PRIZE_SPIN_ROUTE} variant="outlined">
          {t('common.backToSessions')}
        </Button>
      </ErrorStack>
    </ModulePageShell>
  )
}
