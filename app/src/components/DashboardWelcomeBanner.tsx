import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { Crown, ExternalLink, Shield, Tv } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  fetchKickChannel,
  KickChannelNotFoundError,
} from '@/api/kick-channel'
import { IconTile } from '@/components/IconTile'

type DashboardWelcomeBannerProps = {
  accountId: number
  accountName?: string
  role?: 'owner' | 'moderator'
}

function roleLabel(role: 'owner' | 'moderator' | undefined) {
  return role === 'owner' ? 'Owner' : 'Moderator'
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
    <Card
      sx={{
        overflow: 'hidden',
        borderLeft: 4,
        borderLeftStyle: 'solid',
        borderLeftColor: 'primary.main',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
            alignItems: { sm: 'stretch' },
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconTile icon={Tv} variant="primary" size="sm" />
              <Typography variant="body2" color="text.secondary">
                Channel
              </Typography>
            </Box>
            {loading ? (
              <Skeleton width={160} height={32} />
            ) : channelName ? (
              <Typography
                variant="h5"
                component="p"
                sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}
              >
                {channelName}
              </Typography>
            ) : (
              <Typography
                variant="h5"
                component="p"
                color="text.secondary"
                sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}
              >
                —
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'stretch',
              px: { sm: 2 },
            }}
          >
            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: { xs: 'none', sm: 'block' } }}
            />
            <Divider sx={{ display: { xs: 'block', sm: 'none' }, width: '100%' }} />
          </Box>

          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconTile
                  icon={role === 'owner' ? Crown : Shield}
                  variant={role === 'owner' ? 'warning' : 'info'}
                  size="sm"
                />
                <Typography variant="body2" color="text.secondary">
                  Role
                </Typography>
              </Box>
              <Chip label={roleLabel(role)} size="small" sx={{ alignSelf: 'flex-start' }} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconTile icon={ExternalLink} variant="muted" size="sm" />
                <Typography variant="body2" color="text.secondary">
                  Link
                </Typography>
              </Box>
              {loading ? (
                <Skeleton width={160} height={16} />
              ) : slug ? (
                <Link
                  href={`https://kick.com/${slug}`}
                  target="_blank"
                  rel="noreferrer"
                  underline="hover"
                  color="text.primary"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: '0.875rem',
                    lineHeight: 1,
                  }}
                >
                  kick.com/{slug}
                  <ExternalLink size={14} aria-hidden />
                </Link>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1 }}>
                  {fetchError
                    ? 'Could not load channel'
                    : notFound || !channelName
                      ? 'Kick channel not connected'
                      : '—'}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
