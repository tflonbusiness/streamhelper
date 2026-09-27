import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Link from '@mui/material/Link'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import GroupIcon from '@mui/icons-material/Group'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PodcastsIcon from '@mui/icons-material/Podcasts'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useTranslation } from 'react-i18next'
import { KickChannelNotFoundError } from '@/api/kick-channel'
import { SectionHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { StatusAlert } from '@/components/StatusAlert'
import { useKickChannel } from '@/queries/use-kick-channel'

type KickChannelStatsSectionProps = {
  accountId: number
}

function StatCardSkeleton() {
  return (
    <Card>
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
}: KickChannelStatsSectionProps) {
  const { t } = useTranslation()
  const { data: channel, isLoading: loading, error } = useKickChannel(accountId)

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
    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <SectionHeader
        title={t('dashboard.kickStatsTitle')}
        description={t('dashboard.kickStatsDescription')}
      />

      {fetchError ? (
        <StatusAlert tone="error">{fetchError}</StatusAlert>
      ) : null}

      {notFound ? (
        <Typography variant="body2" color="text.secondary">
          {t('dashboard.kickNotConnected')}
        </Typography>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
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

      {channel ? (
        <Link
          href={`https://kick.com/${channel.slug}`}
          target="_blank"
          rel="noreferrer"
          underline="hover"
          color="text.secondary"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            fontSize: '0.875rem',
          }}
        >
          kick.com/{channel.slug}
          <OpenInNewIcon sx={{ fontSize: 14 }} aria-hidden />
        </Link>
      ) : null}
    </Box>
  )
}
