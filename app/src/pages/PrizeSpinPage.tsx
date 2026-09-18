import { Stack } from '@mui/material'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { PrizeSpinHistorySection } from '@/components/prize-spin/PrizeSpinHistorySection'
import { PrizeSpinStreamWidgetSection } from '@/components/prize-spin/PrizeSpinStreamWidgetSection'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/context/AuthContext'

export function PrizeSpinPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <Stack spacing={4}>
      <PageHeader
        title="Prize Spin"
        description="Weighted prize wheel for your stream"
        icon={AutorenewIcon}
        iconVariant="purple"
      />
      <PrizeSpinStreamWidgetSection
        accountId={user?.accountId}
        ucid={user?.ucid}
      />
      <PrizeSpinHistorySection accountId={user.accountId} />
    </Stack>
  )
}
