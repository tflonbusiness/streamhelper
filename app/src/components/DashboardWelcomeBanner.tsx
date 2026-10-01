import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import GroupIcon from '@mui/icons-material/Group'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ShieldIcon from '@mui/icons-material/Shield'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import { alpha, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { KickChannelNotFoundError } from '@/api/kick-channel'
import { IconTile } from '@/components/IconTile'
import { useKickChannel } from '@/queries/use-kick-channel'
import { cardSx } from '@/theme/colors'

type DashboardWelcomeBannerProps = {
  accountId: number
  accountName?: string
  role?: 'owner' | 'moderator'
}

export function DashboardWelcomeBanner({
  accountId,
  accountName,
  role,
}: DashboardWelcomeBannerProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { data: channel, isLoading: loading, error } = useKickChannel(accountId)

  const slug = channel?.slug ?? null
  const notFound = error instanceof KickChannelNotFoundError
  const fetchError = error !== undefined && error !== null && !notFound

  const teamName = accountName?.trim() || t('dashboard.teamFallback')
  const roleLabel =
    role === 'owner' ? t('auth.owner') : t('team.roleModerator')

  return (
    <Card
      sx={{
        ...cardSx,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.background.paper, 1)} 48%)`,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconTile icon={GroupIcon} variant="primary" size="sm" />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {t('dashboard.team')}
              </Typography>
            </Box>
            <Typography
              variant="h4"
              component="p"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
              }}
            >
              {teamName}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                p: 2,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.text.primary, 0.04),
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.6),
              }}
            >
              <IconTile
                icon={role === 'owner' ? WorkspacePremiumIcon : ShieldIcon}
                variant={role === 'owner' ? 'warning' : 'info'}
                size="sm"
              />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {t('dashboard.role')}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip label={roleLabel} size="small" />
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                p: 2,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.text.primary, 0.04),
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.6),
              }}
            >
              <IconTile icon={OpenInNewIcon} variant="muted" size="sm" />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {t('common.link')}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {loading ? (
                    <Skeleton width={140} height={20} />
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
                        fontWeight: 500,
                        lineHeight: 1.3,
                        wordBreak: 'break-all',
                      }}
                    >
                      kick.com/{slug}
                      <OpenInNewIcon sx={{ fontSize: 14, flexShrink: 0 }} aria-hidden />
                    </Link>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                      {fetchError
                        ? t('dashboard.couldNotLoadChannel')
                        : t('dashboard.kickNotConnected')}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
