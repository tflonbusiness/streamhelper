import { Stack } from '@mui/material'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { PrizeSpinHistorySection } from '@/components/prize-spin/prize-spin-page/PrizeSpinHistorySection'
import { PrizeSpinStreamWidgetSection } from '@/components/prize-spin/prize-spin-page/PrizeSpinStreamWidgetSection'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/context/AuthContext'

export function PrizeSpinPage() {
  const { user } = useAuth()

  return (
    <Stack spacing={4}>
      <PageHeader
        title="Prize Spin"
        description="Weighted prize wheel for your stream"
        icon={AutorenewIcon}
        iconVariant="purple"
      />
      {user?.accountId !== undefined && user.ucid ? (
        <PrizeSpinStreamWidgetSection
          accountId={user.accountId}
          ucid={user.ucid}
        />
      ) : null}
      {user?.accountId !== undefined ? (
        <PrizeSpinHistorySection accountId={user.accountId} />
      ) : null}
    </Stack>
  )
}
