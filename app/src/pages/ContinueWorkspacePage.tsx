import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import DashboardIcon from '@mui/icons-material/Dashboard'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router-dom'
import { DotFieldBackground } from '@/components/backgrounds/DotFieldBackground'
import { IconTile } from '@/components/IconTile'
import { PageShell } from '@/components/PageShell'
import { useAuth } from '@/context/AuthContext'
import { cardSx } from '@/theme/colors'

export function ContinueWorkspacePage() {
  const { t } = useTranslation()
  const { user, switchSurface } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return null
  }

  if (!user.platformAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  async function openStreamer() {
    await switchSurface('streamer')
    navigate('/dashboard', { replace: true })
  }

  async function openServicePortal() {
    await switchSurface('service')
    navigate('/service/subscriptions', { replace: true })
  }

  return (
    <>
      <DotFieldBackground />
      <Box sx={{ position: 'relative', zIndex: 1, py: { xs: 4, md: 6 } }}>
        <PageShell wide>
          <Stack spacing={3} sx={{ maxWidth: 720, mx: 'auto' }}>
            <Stack spacing={1} textAlign="center">
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                {t('continueWorkspace.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('continueWorkspace.description')}
              </Typography>
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              useFlexGap
            >
              <Card sx={{ ...cardSx, flex: 1 }}>
                <CardActionArea onClick={() => void openStreamer()}>
                  <CardContent>
                    <Stack spacing={2}>
                      <IconTile icon={DashboardIcon} variant="primary" size="md" />
                      <Typography variant="h6" component="h2">
                        {t('continueWorkspace.streamerTitle')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('continueWorkspace.streamerDescription')}
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>

              <Card sx={{ ...cardSx, flex: 1 }}>
                <CardActionArea onClick={() => void openServicePortal()}>
                  <CardContent>
                    <Stack spacing={2}>
                      <IconTile
                        icon={AdminPanelSettingsIcon}
                        variant="info"
                        size="md"
                      />
                      <Typography variant="h6" component="h2">
                        {t('continueWorkspace.serviceTitle')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('continueWorkspace.serviceDescription')}
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Stack>
          </Stack>
        </PageShell>
      </Box>
    </>
  )
}
