import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ShieldIcon from '@mui/icons-material/Shield'
import TvIcon from '@mui/icons-material/Tv'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import { useTranslation } from 'react-i18next'
import { KickChannelNotFoundError } from '@/api/kick-channel'
import { IconTile } from '@/components/IconTile'
import { useKickChannel } from '@/queries/use-kick-channel'

type DashboardWelcomeBannerProps = {
  accountId: number
  accountName?: string
  role?: 'owner' | 'moderator'
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
  const { t } = useTranslation()
  const { data: channel, isLoading: loading, error } = useKickChannel(accountId)

  const slug = channel?.slug ?? null
  const notFound = error instanceof KickChannelNotFoundError
  const fetchError = error !== undefined && error !== null && !notFound

  const channelName = channelDisplayName(accountName, slug)
  const roleLabel =
    role === 'owner' ? t('auth.owner') : t('team.roleModerator')

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
              <IconTile icon={TvIcon} variant="primary" size="sm" />
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.channel')}
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
                  icon={role === 'owner' ? WorkspacePremiumIcon : ShieldIcon}
                  variant={role === 'owner' ? 'warning' : 'info'}
                  size="sm"
                />
                <Typography variant="body2" color="text.secondary">
                  {t('dashboard.role')}
                </Typography>
              </Box>
              <Chip label={roleLabel} size="small" sx={{ alignSelf: 'flex-start' }} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconTile icon={OpenInNewIcon} variant="muted" size="sm" />
                <Typography variant="body2" color="text.secondary">
                  {t('common.link')}
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
                  <OpenInNewIcon sx={{ fontSize: 14 }} aria-hidden />
                </Link>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1 }}>
                  {fetchError
                    ? t('dashboard.couldNotLoadChannel')
                    : notFound || !channelName
                      ? t('dashboard.kickNotConnected')
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
