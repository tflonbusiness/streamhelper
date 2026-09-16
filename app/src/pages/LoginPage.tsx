import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Gamepad2, Layers, Users } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { BrandHeader } from '@/components/BrandHeader'
import { IconTile } from '@/components/IconTile'
import { KickLoginButton } from '@/components/KickLoginButton'
import { PageShell } from '@/components/PageShell'
import { StatusAlert } from '@/components/StatusAlert'

const features = [
  {
    icon: Gamepad2,
    variant: 'primary' as const,
    title: 'Chat games',
    description: 'Interactive games for Kick chat',
  },
  {
    icon: Users,
    variant: 'info' as const,
    title: 'Team access',
    description: 'Manage moderators and permissions',
  },
  {
    icon: Layers,
    variant: 'purple' as const,
    title: 'OBS overlays',
    description: 'Browser sources for your stream',
  },
]

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const joinError = searchParams.get('join_error')
  const authError = searchParams.get('auth_error')

  return (
    <PageShell>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <BrandHeader description="Streamer dashboard" />

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

            <Box
              sx={{
                borderTop: 1,
                borderColor: 'divider',
                pt: 3,
              }}
            >
              <Grid container spacing={1.5}>
                {features.map((feature) => (
                  <Grid key={feature.title} size={{ xs: 12, sm: 4 }}>
                    <Stack
                      spacing={1}
                      sx={{
                        alignItems: 'center',
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'background.default',
                        p: 1.5,
                        textAlign: 'center',
                      }}
                    >
                      <IconTile
                        icon={feature.icon}
                        variant={feature.variant}
                        size="sm"
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </PageShell>
  )
}
