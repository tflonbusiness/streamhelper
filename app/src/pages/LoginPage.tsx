import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import GroupIcon from '@mui/icons-material/Group'
import LayersIcon from '@mui/icons-material/Layers'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { AppLogo } from '@/components/AppLogo'
import { AppBrandName, appBrandNamePlain } from '@/components/AppBrandName'
import { DotFieldBackground } from '@/components/backgrounds/DotFieldBackground'
import { IconTile } from '@/components/IconTile'
import {
  loginCardContentSx,
  loginCardGlowSx,
  loginCardInnerSx,
  loginCardOuterSx,
  loginCardShineSx,
  loginDividerSx,
  loginFeatureItemSx,
  loginLogoRingSx,
  loginTaglineSx,
} from '@/components/login/loginPageStyles'
import { KickLoginButton } from '@/components/KickLoginButton'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { PageShell } from '@/components/PageShell'
import { StatusAlert } from '@/components/StatusAlert'

export function LoginPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const joinError = searchParams.get('join_error')
  const authError = searchParams.get('auth_error')

  const features = [
    {
      icon: SportsEsportsIcon,
      variant: 'purple' as const,
      title: t('auth.featureChatGames'),
      description: t('auth.featureChatGamesDesc'),
    },
    {
      icon: GroupIcon,
      variant: 'info' as const,
      title: t('auth.featureTeamAccess'),
      description: t('auth.featureTeamAccessDesc'),
    },
    {
      icon: LayersIcon,
      variant: 'primary' as const,
      title: t('auth.featureObsOverlays'),
      description: t('auth.featureObsOverlaysDesc'),
    },
  ]

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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Box sx={{ width: 120 }}>
                    <LanguageSwitcher compact />
                  </Box>
                </Box>
                <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
                  <Box sx={loginLogoRingSx}>
                    <AppLogo alt={appBrandNamePlain(t)} size="lg" />
                  </Box>

                  <Stack spacing={0.75}>
                    <AppBrandName size="lg" component="h1" />
                    <Typography variant="body2" sx={loginTaglineSx}>
                      {t('auth.tagline')}
                    </Typography>
                  </Stack>
                </Stack>

                {joinError ? (
                  <StatusAlert tone="error">
                    {t('auth.joinLinkInvalid')}
                  </StatusAlert>
                ) : null}

                {authError ? (
                  <StatusAlert tone="error">
                    {authError === 'state'
                      ? t('auth.signInStateExpired')
                      : t('auth.signInFailed')}
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
                        size="md"
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ lineHeight: 1.45, display: 'block' }}
                      >
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
