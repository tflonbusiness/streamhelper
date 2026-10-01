import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import LinkIcon from '@mui/icons-material/Link'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ShieldIcon from '@mui/icons-material/Shield'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import type { SvgIconComponent } from '@mui/icons-material'
import { alpha, useTheme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { KickChannelNotFoundError } from '@/api/kick-channel'
import { DashboardTariffCard } from '@/components/DashboardTariffCard'
import { IconTile, type IconTileVariant } from '@/components/IconTile'
import type { AuthUser } from '@/api/auth'
import { useKickChannel } from '@/queries/use-kick-channel'
import { cardSx } from '@/theme/colors'

type DashboardWelcomeBannerProps = {
  user: AuthUser
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

function MetaColumn({
  label,
  icon,
  iconVariant = 'muted',
  children,
}: {
  label: string
  icon: SvgIconComponent
  iconVariant?: IconTileVariant
  children: ReactNode
}) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        p: { xs: 1.5, sm: 1.75 },
        borderRadius: 1.5,
        bgcolor: alpha(theme.palette.text.primary, 0.035),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconTile icon={icon} variant={iconVariant} size="sm" />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontWeight: 600,
            fontSize: '0.6875rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>
      </Box>
      <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {children}
      </Box>
    </Box>
  )
}

export function DashboardWelcomeBanner({ user }: DashboardWelcomeBannerProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const accountId = user.accountId!
  const accountName = user.accountName
  const role = user.role
  const { data: channel, isLoading: loading, error } = useKickChannel(accountId)

  const slug = channel?.slug ?? null
  const fetchError =
    error !== undefined && error !== null && !(error instanceof KickChannelNotFoundError)

  const channelName =
    channelDisplayName(accountName, slug) || t('dashboard.teamFallback')
  const roleLabel =
    role === 'owner' ? t('auth.owner') : t('team.roleModerator')
  const isOwner = role === 'owner'

  return (
    <Card
      sx={{
        ...cardSx,
        overflow: 'hidden',
        background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 42%)`,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {t('dashboard.channel')}
              </Typography>
              {loading ? (
                <Skeleton width="min(100%, 280px)" height={36} sx={{ mt: 0.75 }} />
              ) : (
                <>
                  <Box
                    sx={{
                      mt: 0.5,
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="h4"
                      component="p"
                      sx={{
                        fontWeight: 700,
                        letterSpacing: '-0.03em',
                        lineHeight: 1.12,
                        wordBreak: 'break-word',
                      }}
                    >
                      {channelName}
                    </Typography>
                    {channel?.isLive ? (
                      <Chip
                        label={t('common.live')}
                        size="small"
                        color="success"
                        sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 700 }}
                      />
                    ) : null}
                  </Box>
                  {channel?.streamTitle && channel.isLive ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.75,
                        lineHeight: 1.45,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {channel.streamTitle}
                    </Typography>
                  ) : null}
                </>
              )}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 1.5,
              '& > *:last-child': {
                gridColumn: { xs: 'auto', sm: '1 / -1', md: 'auto' },
              },
            }}
          >
            <MetaColumn label={t('dashboard.planTitle')} icon={CreditCardIcon} iconVariant="primary">
              <DashboardTariffCard user={user} />
            </MetaColumn>

            <MetaColumn
              label={t('dashboard.role')}
              icon={isOwner ? WorkspacePremiumIcon : ShieldIcon}
              iconVariant={isOwner ? 'warning' : 'info'}
            >
              <Chip
                label={roleLabel}
                size="small"
                sx={{
                  alignSelf: 'flex-start',
                  fontWeight: 600,
                  ...(isOwner
                    ? {
                        bgcolor: alpha(theme.palette.warning.main, 0.12),
                        color: theme.palette.warning.light,
                      }
                    : {
                        bgcolor: alpha(theme.palette.info.main, 0.12),
                        color: theme.palette.info.light,
                      }),
                }}
              />
            </MetaColumn>

            <MetaColumn label={t('common.link')} icon={LinkIcon} iconVariant="muted">
              {loading ? (
                <Skeleton width="min(100%, 200px)" height={20} />
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
                    maxWidth: '100%',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                >
                  <Typography component="span" variant="body2" sx={{ fontWeight: 500 }} noWrap>
                    kick.com/{slug}
                  </Typography>
                  <OpenInNewIcon sx={{ fontSize: 15, flexShrink: 0, opacity: 0.7 }} aria-hidden />
                </Link>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.45 }}>
                  {fetchError
                    ? t('dashboard.couldNotLoadChannel')
                    : t('dashboard.kickNotConnected')}
                </Typography>
              )}
            </MetaColumn>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
