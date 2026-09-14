import { Eye, ExternalLink, Gift, Radio, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  fetchKickChannel,
  KickChannelNotFoundError,
  type KickChannelDto,
} from '@/api/kick-channel'
import { SectionHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type KickChannelStatsSectionProps = {
  accountId: number
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-3 pb-2">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
    </Card>
  )
}

export function KickChannelStatsSection({
  accountId,
}: KickChannelStatsSectionProps) {
  const [channel, setChannel] = useState<KickChannelDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      setNotFound(false)
      setChannel(null)

      try {
        const data = await fetchKickChannel(accountId)
        if (!cancelled) {
          setChannel(data)
        }
      } catch (err) {
        if (cancelled) {
          return
        }
        if (err instanceof KickChannelNotFoundError) {
          setNotFound(true)
          return
        }
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load Kick channel',
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [accountId])

  const viewerSubtext = channel?.isLive
    ? [channel.categoryName, channel.isMature ? '18+' : null]
        .filter(Boolean)
        .join(' · ') || 'watching now'
    : 'off air'

  return (
    <section className="space-y-3">
      <SectionHeader
        title="Kick stats"
        description="Live channel metrics from Kick"
      />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {notFound ? (
        <p className="text-sm text-muted-foreground">
          Kick channel not connected
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
              value={channel.isLive ? 'Live' : 'Offline'}
              label="Stream status"
              subtext={channel.streamTitle ?? channel.slug}
              icon={Radio}
              variant={channel.isLive ? 'success' : 'muted'}
              highlight={channel.isLive}
            />
            <StatCard
              value={
                channel.isLive && channel.viewerCount != null
                  ? String(channel.viewerCount)
                  : '—'
              }
              label="Viewers"
              subtext={viewerSubtext}
              icon={Eye}
              variant="info"
            />
            <StatCard
              value={
                channel.activeSubscribersCount != null
                  ? String(channel.activeSubscribersCount)
                  : '—'
              }
              label="Subscribers"
              icon={Users}
              variant="purple"
            />
            <StatCard
              value={
                channel.activeGiftedSubscribersCount != null
                  ? String(channel.activeGiftedSubscribersCount)
                  : '—'
              }
              label="Gifted"
              subtext="gifted subs"
              icon={Gift}
              variant="warning"
            />
          </>
        ) : null}
      </div>

      {channel ? (
        <a
          href={`https://kick.com/${channel.slug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          kick.com/{channel.slug}
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      ) : null}
    </section>
  )
}
