import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import GroupIcon from '@mui/icons-material/Group'
import PodcastsIcon from '@mui/icons-material/Podcasts'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useTranslation } from 'react-i18next'
import { KickChannelNotFoundError } from '@/api/kick-channel'
import { DashboardSection } from '@/components/DashboardSection'
import { StatCard } from '@/components/StatCard'
import { StatusAlert } from '@/components/StatusAlert'
import { useKickChannel } from '@/queries/use-kick-channel'
import { cardSx } from '@/theme/colors'

type KickChannelStatsSectionProps = {
  accountId: number
  layout?: 'full' | 'sidebar'
}

function StatCardSkeleton() {
  return (
    <Card sx={cardSx} elevation={0}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 2 }}>
        <Skeleton variant="rounded" width={32} height={32} />
        <Skeleton width={64} height={36} />
        <Skeleton width={96} height={16} />
      </CardContent>
    </Card>
  )
}

export function KickChannelStatsSection({
  accountId,
  layout = 'full',
}: KickChannelStatsSectionProps) {
  const { t } = useTranslation()
  const { data: channel, isLoading: loading, error } = useKickChannel(accountId)
  const sidebar = layout === 'sidebar'

  const notFound = error instanceof KickChannelNotFoundError
  const fetchError =
    error && !notFound
      ? error instanceof Error
        ? error.message
        : t('errors.api.loadKickChannel')
      : null

  const viewerSubtext = channel?.isLive
    ? [channel.categoryName, channel.isMature ? t('dashboard.matureBadge') : null]
        .filter(Boolean)
        .join(' · ') || t('dashboard.watchingNow')
    : t('dashboard.offAir')

  return (
    <DashboardSection
      title={t('dashboard.kickStatsTitle')}
      description={sidebar ? undefined : t('dashboard.kickStatsDescription')}
      variant="panel"
      headerInPanel
    >
      {fetchError ? (
        <StatusAlert tone="error">{fetchError}</StatusAlert>
      ) : null}

      {notFound && !fetchError ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('dashboard.kickNotConnected')}
        </Typography>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: sidebar
            ? 'repeat(2, 1fr)'
            : { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: sidebar ? 1.5 : 2,
        }}
      >
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : channel ? (
          <>
            <StatCard
              value={channel.isLive ? t('common.live') : t('common.offline')}
              label={t('dashboard.streamStatus')}
              subtext={channel.streamTitle ?? channel.slug}
              icon={PodcastsIcon}
              variant={channel.isLive ? 'success' : 'muted'}
              highlight={channel.isLive}
            />
            <StatCard
              value={
                channel.isLive && channel.viewerCount != null
                  ? String(channel.viewerCount)
                  : '—'
              }
              label={t('dashboard.viewers')}
              subtext={viewerSubtext}
              icon={VisibilityIcon}
              variant="info"
            />
            <StatCard
              value={
                channel.activeSubscribersCount != null
                  ? String(channel.activeSubscribersCount)
                  : '—'
              }
              label={t('dashboard.subscribers')}
              icon={GroupIcon}
              variant="purple"
            />
            <StatCard
              value={
                channel.activeGiftedSubscribersCount != null
                  ? String(channel.activeGiftedSubscribersCount)
                  : '—'
              }
              label={t('dashboard.gifted')}
              subtext={t('dashboard.giftedSubs')}
              icon={CardGiftcardIcon}
              variant="warning"
            />
          </>
        ) : null}
      </Box>
    </DashboardSection>
  )
}
