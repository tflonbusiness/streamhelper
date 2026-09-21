import { Stack } from '@mui/material'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import { BonusBuyHistorySection } from '@/components/bonus-buy/bonus-buy-page/BonusBuyHistorySection'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/context/AuthContext'

export function BonusBuyPage() {
  const { user } = useAuth()

  return (
    <Stack spacing={4}>
      <PageHeader
        title="Bonus Buy"
        description="Bonus buy widget for your stream"
        icon={CardGiftcardIcon}
        iconVariant="warning"
      />
      {user?.accountId !== undefined ? (
        <BonusBuyHistorySection accountId={user.accountId} />
      ) : null}
    </Stack>
  )
}
