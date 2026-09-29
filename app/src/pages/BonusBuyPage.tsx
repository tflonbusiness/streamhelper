import { Stack } from '@mui/material'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import { useTranslation } from 'react-i18next'
import { BonusBuyHistorySection } from '@/components/bonus-buy/bonus-buy-page/BonusBuyHistorySection'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/context/AuthContext'

export function BonusBuyPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <Stack spacing={4}>
      <PageHeader
        title={t('bonusBuy.title')}
        description={t('bonusBuy.description')}
        icon={CardGiftcardIcon}
        iconVariant="info"
      />
      {user?.accountId !== undefined ? (
        <BonusBuyHistorySection accountId={user.accountId} />
      ) : null}
    </Stack>
  )
}
