import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import GroupIcon from '@mui/icons-material/Group'
import LayersIcon from '@mui/icons-material/Layers'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import { useSearchParams } from 'react-router-dom'
import { DotFieldBackground } from '@/components/backgrounds/DotFieldBackground'
import { IconTile } from '@/components/IconTile'
import {
  loginCardContentSx,
  loginCardGlowSx,
  loginCardInnerSx,
  loginCardOuterSx,
  loginCardShineSx,
  loginDividerSx,
  loginEyebrowDotSx,
  loginEyebrowSx,
  loginFeatureItemSx,
  loginLogoRingSx,
  loginTaglineSx,
} from '@/components/login/loginPageStyles'
import { KickLoginButton } from '@/components/KickLoginButton'
import { PageShell } from '@/components/PageShell'
import { StatusAlert } from '@/components/StatusAlert'

const features = [
  {
    icon: SportsEsportsIcon,
    variant: 'purple' as const,
    title: 'Chat games',
    description: 'Interactive games for Kick chat',
  },
  {
    icon: GroupIcon,
    variant: 'info' as const,
    title: 'Team access',
    description: 'Manage moderators and permissions',
  },
  {
    icon: LayersIcon,
    variant: 'primary' as const,
    title: 'OBS overlays',
    description: 'Browser sources for your stream',
  },
]

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const joinError = searchParams.get('join_error')
  const authError = searchParams.get('auth_error')

  return (
    <>
      <DotFieldBackground />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <PageShell wide>
          <Box sx={loginCardOuterSx}>
            <Box sx={loginCardInnerSx}>
              <Box sx={loginCardGlowSx} aria-hidden />
              <Box sx={loginCardShineSx} aria-hidden />

              <Stack spacing={3} sx={loginCardContentSx}>
                <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
                  <Box sx={loginEyebrowSx}>
                    <Box sx={loginEyebrowDotSx} aria-hidden />
                    Stream tools
                  </Box>

                  <Box sx={loginLogoRingSx}>
                    <Box
                      component="img"
                      src="/logo.svg"
                      alt="Caz Agent"
                      sx={{ width: 44, height: 44 }}
                    />
                  </Box>

                  <Stack spacing={0.75}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                      Caz Agent
                    </Typography>
                    <Typography variant="body2" sx={loginTaglineSx}>
                      Streamer dashboard for Kick creators
                    </Typography>
                  </Stack>
                </Stack>

                {joinError ? (
                  <StatusAlert tone="error">
                    This link is invalid or has been revoked.
                  </StatusAlert>
                ) : null}

                {authError ? (
                  <StatusAlert tone="error">
                    {authError === 'state'
                      ? 'Your sign-in session expired. Click "Sign in with Kick" again.'
                      : 'Could not sign in with Kick. Check your app settings and try again.'}
                  </StatusAlert>
                ) : null}

                <KickLoginButton />

                <Box sx={loginDividerSx} aria-hidden />

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  useFlexGap
                >
                  {features.map((feature) => (
                    <Stack key={feature.title} sx={loginFeatureItemSx}>
                      <IconTile
                        icon={feature.icon}
                        variant={feature.variant}
                        size="sm"
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                        {feature.description}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Box>
          </Box>
        </PageShell>
      </Box>
    </>
  )
}
