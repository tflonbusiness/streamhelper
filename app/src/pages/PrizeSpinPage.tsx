import { Stack } from '@mui/material'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { useTranslation } from 'react-i18next'
import { PrizeSpinHistorySection } from '@/components/prize-spin/prize-spin-page/PrizeSpinHistorySection'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/context/AuthContext'

export function PrizeSpinPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <Stack spacing={4}>
      <PageHeader
        title={t('prizeSpin.title')}
        description={t('prizeSpin.description')}
        icon={AutorenewIcon}
        iconVariant="purple"
      />
      {user?.accountId !== undefined ? (
        <PrizeSpinHistorySection accountId={user.accountId} />
      ) : null}
    </Stack>
  )
}
