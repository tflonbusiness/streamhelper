import { Crown, ExternalLink, Shield, Tv } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  fetchKickChannel,
  KickChannelNotFoundError,
} from '@/api/kick-channel'
import { IconTile } from '@/components/IconTile'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

type DashboardWelcomeBannerProps = {
  accountId: number
  accountName?: string
  role?: 'owner' | 'admin'
}

function roleLabel(role: 'owner' | 'admin' | undefined) {
  return role === 'owner' ? 'Owner' : 'Admin'
}

function channelDisplayName(accountName?: string, slug?: string | null) {
  const name = accountName?.trim()
  if (name) {
    return name
  }
  if (slug?.trim()) {
    return slug.trim()
  }
  return null
}

export function DashboardWelcomeBanner({
  accountId,
  accountName,
  role,
}: DashboardWelcomeBannerProps) {
  const [slug, setSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setFetchError(false)
      setNotFound(false)
      setSlug(null)

      try {
        const data = await fetchKickChannel(accountId)
        if (!cancelled) {
          setSlug(data.slug)
        }
      } catch (err) {
        if (cancelled) {
          return
        }
        if (err instanceof KickChannelNotFoundError) {
          setNotFound(true)
          return
        }
        setFetchError(true)
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

  const channelName = channelDisplayName(accountName, slug)

  return (
    <Card className="overflow-hidden border-l-4 border-l-primary">
      <CardHeader className="p-4">
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-stretch sm:gap-0">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <IconTile icon={Tv} variant="primary" size="sm" />
              <CardDescription>Channel</CardDescription>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-40" />
            ) : channelName ? (
              <CardTitle className="text-2xl font-bold tracking-tight">
                {channelName}
              </CardTitle>
            ) : (
              <CardTitle className="text-2xl font-bold tracking-tight text-muted-foreground">
                —
              </CardTitle>
            )}
          </div>

          <div className="flex items-stretch px-4">
            <Separator className="sm:hidden" />
            <Separator orientation="vertical" className="hidden sm:block" />
          </div>

          <div className="flex flex-col justify-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <IconTile
                  icon={role === 'owner' ? Crown : Shield}
                  variant={role === 'owner' ? 'warning' : 'info'}
                  size="sm"
                />
                <CardDescription>Role</CardDescription>
              </div>
              <Badge variant="secondary" className="shrink-0">
                {roleLabel(role)}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <IconTile icon={ExternalLink} variant="muted" size="sm" />
                <CardDescription>Link</CardDescription>
              </div>
              {loading ? (
                <Skeleton className="h-4 w-40" />
              ) : slug ? (
                <p className="text-sm leading-none">
                  <a
                    href={`https://kick.com/${slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-foreground hover:underline"
                  >
                    kick.com/{slug}
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                </p>
              ) : (
                <p className="text-sm leading-none text-muted-foreground">
                  {fetchError
                    ? 'Could not load channel'
                    : notFound || !channelName
                      ? 'Kick channel not connected'
                      : '—'}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
